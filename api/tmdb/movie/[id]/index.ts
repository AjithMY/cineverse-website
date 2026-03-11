import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.VITE_TMDB_API_KEY;
  const { id } = req.query;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'VITE_TMDB_API_KEY is not configured' });
  }

  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=videos,images`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
}
