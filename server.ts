import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

dotenv.config();

console.log('--- CINEVERSE SERVER STARTING ---');
console.log('NODE_ENV:', process.env.NODE_ENV);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cineverse.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    bio TEXT,
    photoURL TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    movieId INTEGER,
    rating INTEGER,
    review TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    movieId INTEGER,
    movieTitle TEXT,
    moviePoster TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    UNIQUE(userId, movieId)
  );
`);

export const app = express();
const PORT = 3000;

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

app.get("/api/ping", (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

// Alias for direct movie calls as requested in user example
app.get("/api/movie/:id", (req, res) => {
  const { id } = req.params;
  res.redirect(`/api/tmdb/movie/${id}`);
});

// TMDB Proxy - MOVED TO ABSOLUTE TOP
app.use("/api/tmdb", async (req, res) => {
  // In app.use("/api/tmdb"), req.url is the part after /api/tmdb
  const endpoint = req.url.split('?')[0].replace(/^\//, '');
  console.log(`[TMDB Proxy] Processing: ${endpoint} (Full URL: ${req.url})`);
  
  if (!TMDB_API_KEY) {
    console.error("[TMDB Proxy] API Key missing");
    return res.status(500).json({ error: "TMDB API Key is not configured in environment variables." });
  }

  const queryParams = new URLSearchParams(req.query as any);
  
  let tmdbEndpoint = endpoint;
  if (endpoint === "trending") {
    const timeWindow = queryParams.get("timeWindow") || "week";
    tmdbEndpoint = `trending/movie/${timeWindow}`;
    queryParams.delete("timeWindow");
  } else if (endpoint === "popular") {
    tmdbEndpoint = "movie/popular";
  } else if (endpoint === "top-rated") {
    tmdbEndpoint = "movie/top_rated";
  } else if (endpoint === "upcoming") {
    tmdbEndpoint = "movie/upcoming";
  } else if (endpoint === "discover") {
    tmdbEndpoint = "discover/movie";
  }

  queryParams.set("api_key", TMDB_API_KEY);
  
  const cacheKey = `${tmdbEndpoint}?${queryParams.toString()}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  const url = `https://api.themoviedb.org/3/${tmdbEndpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`TMDB returned non-JSON (${contentType}):`, text.substring(0, 200));
      return res.status(502).json({ error: "Invalid response from TMDB API" });
    }

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (err) {
    console.error("TMDB Proxy Error:", err);
    res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
});

// Trust proxy for rate limiting behind Nginx/Cloud Run
app.set('trust proxy', 1);

// Security Middleware - DISABLED TEMPORARILY
/*
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "https://image.tmdb.org", "https://via.placeholder.com", "data:", "https://*.tmdb.org"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], 
      "connect-src": ["'self'", "https://api.themoviedb.org", "*"], // Relaxed for dev/iframe compatibility
      "frame-src": ["'self'", "https://www.youtube.com", "https://*.youtube.com"],
      "frame-ancestors": ["*"], // Allow iframe embedding in AI Studio
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false, // Disable X-Frame-Options to allow iframe embedding
}));
*/

// Rate Limiting - DISABLED TEMPORARILY
/*
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Increased for development
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", apiLimiter);
*/

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
if (process.env.NODE_ENV === "production" && JWT_SECRET === "fallback-secret") {
  console.warn("WARNING: Using fallback JWT_SECRET in production. Set JWT_SECRET in environment variables.");
}
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;

// Simple In-Memory Cache for TMDB
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

app.use(express.json());
app.use(cookieParser());

// Middleware to verify JWT
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;

  // Basic Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (email.length > 255 || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (name.length > 100) {
    return res.status(400).json({ error: "Name is too long" });
  }

  const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds

  try {
    const info = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
    const token = jwt.sign({ id: info.lastInsertRowid, email, name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { id: info.lastInsertRowid, email, name } });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.get("/api/auth/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ user: null });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user: any = db.prepare("SELECT id, email, name, bio, photoURL FROM users WHERE id = ?").get(decoded.id);
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

app.patch("/api/auth/profile", authenticate, (req: any, res) => {
  const { name, bio, photoURL } = req.body;
  try {
    db.prepare("UPDATE users SET name = ?, bio = ?, photoURL = ? WHERE id = ?").run(name, bio, photoURL, req.user.id);
    const user: any = db.prepare("SELECT id, email, name, bio, photoURL FROM users WHERE id = ?").get(req.user.id);
    
    // Update token with new name if it changed
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: "Failed to update profile" });
  }
});

// Reviews Routes
app.get("/api/reviews/:movieId", (req, res) => {
  const reviews = db.prepare(`
    SELECT reviews.*, users.name as userName 
    FROM reviews 
    JOIN users ON reviews.userId = users.id 
    WHERE movieId = ? 
    ORDER BY createdAt DESC
  `).all(req.params.movieId);
  res.json(reviews);
});

app.post("/api/reviews", authenticate, (req: any, res) => {
  const { movieId, rating, review } = req.body;
  const info = db.prepare("INSERT INTO reviews (userId, movieId, rating, review) VALUES (?, ?, ?, ?)").run(req.user.id, movieId, rating, review);
  res.json({ id: info.lastInsertRowid });
});

app.delete("/api/reviews/:id", authenticate, (req: any, res) => {
  const info = db.prepare("DELETE FROM reviews WHERE id = ? AND userId = ?").run(req.params.id, req.user.id);
  if (info.changes === 0) return res.status(403).json({ error: "Unauthorized or not found" });
  res.json({ success: true });
});

// Watchlist Routes
app.get("/api/watchlist", authenticate, (req: any, res) => {
  const list = db.prepare("SELECT * FROM watchlist WHERE userId = ?").all(req.user.id);
  res.json(list);
});

app.post("/api/watchlist", authenticate, (req: any, res) => {
  const { movieId, movieTitle, moviePoster } = req.body;
  try {
    db.prepare("INSERT INTO watchlist (userId, movieId, movieTitle, moviePoster) VALUES (?, ?, ?, ?)").run(req.user.id, movieId, movieTitle, moviePoster);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Already in watchlist" });
  }
});

app.delete("/api/watchlist/:movieId", authenticate, (req: any, res) => {
  db.prepare("DELETE FROM watchlist WHERE userId = ? AND movieId = ?").run(req.user.id, req.params.movieId);
  res.json({ success: true });
});

// API 404 Handler - Prevent falling through to SPA fallback for API routes
app.all("/api/*", (req, res) => {
  console.log(`[API 404] Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
