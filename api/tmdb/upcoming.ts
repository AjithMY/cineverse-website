import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB API Key is not configured' });
  }

  const { page = '1' } = req.query;
  
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&page=${page}`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
}
