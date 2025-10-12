const envBase = import.meta.env.VITE_API_BASE_URL?.trim();

const defaultBase = envBase
  ? envBase
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "/.netlify/functions";

const useNetlifyFunctions = defaultBase.includes("/.netlify/functions");

function join(base: string, path: string) {
  if (!path) return base;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
}

const endpoints = {
  map: "map",
  earthquakes: useNetlifyFunctions ? "earthquakes" : "api/earthquakes",
  search: useNetlifyFunctions ? "earthquakes-search" : "api/earthquakes/search",
  searchByCountry: useNetlifyFunctions
    ? "earthquakes-by-country"
    : "api/earthquakes/search-by-country",
};

export function getEndpoint(key: keyof typeof endpoints, query?: Record<string, string | number | undefined>) {
  const path = endpoints[key];
  const url = join(defaultBase, path);
  if (!query) return url;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(k, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export function getApiMode() {
  return useNetlifyFunctions ? "functions" : "server";
}
