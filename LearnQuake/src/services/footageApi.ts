const FOOTAGE_ENDPOINT = import.meta.env.VITE_FOOTAGE_ENDPOINT ?? '/api/footage';

export interface FootageItem {
  id: string;
  title: string;
  description: string;
  channel: string;
  publishedAt: string;
  thumbnail: string;
}

export async function fetchEarthquakeFootage(region = 'PH', maxResults = 8): Promise<FootageItem[]> {
  const response = await fetch(`${FOOTAGE_ENDPOINT}?region=${region}&maxResults=${maxResults}`);

  if (!response.ok) {
    throw new Error('Failed to load earthquake videos');
  }

  const payload = await response.json();
  return payload.data ?? [];
}