import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.VITE_TMDB_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'VITE_TMDB_API_KEY is not configured' });
  }

  const queryParams = new URLSearchParams();
  Object.keys(req.query).forEach(key => {
    queryParams.set(key, req.query[key] as string);
  });
  queryParams.set('api_key', apiKey);

  try {
    const url = `https://api.themoviedb.org/3/search/movie?${queryParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
}
