import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// 1. Initialize dotenv at the absolute top
dotenv.config();

// 2. Configuration and Constants
const TMDB_API_KEY = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- CINEVERSE SERVER STARTING ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('TMDB_API_KEY configured:', !!TMDB_API_KEY);

export const app = express();
const PORT = 3000;

// Basic Middleware
app.use(express.json());
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Database Setup
let db: any;

async function getDb() {
  if (db) return db;
  
  try {
    console.log("Initializing database module...");
    const { default: Database } = await import("better-sqlite3");
    
    try {
      db = new Database("cineverse.db");
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
      console.log("File-based database initialized.");
    } catch (err) {
      console.error("Failed to initialize file-based database:", err);
      if (process.env.VERCEL) {
        console.log("Falling back to in-memory database for Vercel environment");
        db = new Database(":memory:");
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
        console.log("In-memory database initialized.");
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("Critical: Failed to load better-sqlite3", err);
  }
  return db;
}

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

// --- API ROUTES ---

app.get("/api/ping", (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

// TMDB Proxy
app.use("/api/tmdb", async (req, res) => {
  try {
    const endpoint = req.url.split('?')[0].replace(/^\//, '');
    
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: "TMDB API Key is not configured." });
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
    const response = await fetch(url);
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json(errData);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    res.json(data);
  } catch (err: any) {
    console.error("TMDB Proxy Error:", err);
    res.status(500).json({ error: "Failed to fetch from TMDB", message: err.message });
  }
});

// Auth Routes
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");

    const info = database.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
    const token = jwt.sign({ id: info.lastInsertRowid, email, name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { id: info.lastInsertRowid, email, name } });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");

    const user: any = database.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

app.get("/api/auth/me", async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");

    const user: any = database.prepare("SELECT id, email, name, bio, photoURL FROM users WHERE id = ?").get(decoded.id);
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

app.patch("/api/auth/profile", authenticate, async (req: any, res, next) => {
  try {
    const { name, bio, photoURL } = req.body;
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");

    database.prepare("UPDATE users SET name = ?, bio = ?, photoURL = ? WHERE id = ?").run(name, bio, photoURL, req.user.id);
    const user: any = database.prepare("SELECT id, email, name, bio, photoURL FROM users WHERE id = ?").get(req.user.id);
    
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Review & Watchlist Routes
app.get("/api/reviews/:movieId", async (req, res, next) => {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const reviews = database.prepare(`
      SELECT reviews.*, users.name as userName 
      FROM reviews JOIN users ON reviews.userId = users.id 
      WHERE movieId = ? ORDER BY createdAt DESC
    `).all(req.params.movieId);
    res.json(reviews);
  } catch (err) { next(err); }
});

app.post("/api/reviews", authenticate, async (req: any, res, next) => {
  try {
    const { movieId, rating, review } = req.body;
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const info = database.prepare("INSERT INTO reviews (userId, movieId, rating, review) VALUES (?, ?, ?, ?)").run(req.user.id, movieId, rating, review);
    res.json({ id: info.lastInsertRowid });
  } catch (err) { next(err); }
});

app.get("/api/watchlist", authenticate, async (req: any, res, next) => {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    const list = database.prepare("SELECT * FROM watchlist WHERE userId = ?").all(req.user.id);
    res.json(list);
  } catch (err) { next(err); }
});

app.post("/api/watchlist", authenticate, async (req: any, res, next) => {
  try {
    const { movieId, movieTitle, moviePoster } = req.body;
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    database.prepare("INSERT INTO watchlist (userId, movieId, movieTitle, moviePoster) VALUES (?, ?, ?, ?)").run(req.user.id, movieId, movieTitle, moviePoster);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: "Already in watchlist" }); }
});

app.delete("/api/watchlist/:movieId", authenticate, async (req: any, res, next) => {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database unavailable");
    database.prepare("DELETE FROM watchlist WHERE userId = ? AND movieId = ?").run(req.user.id, req.params.movieId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

// Error Handling
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Server Startup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
  }

  if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV === 'development') {
  startServer();
}

export default app;
