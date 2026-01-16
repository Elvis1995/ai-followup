export const API_BASE = "http://localhost:3001";

export function getApiKey() {
  return localStorage.getItem("apiKey") || "";
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const apiKey = getApiKey();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
  });

  // Om du vill debugga lätt:
  // const text = await res.text(); console.log(path, res.status, text); return JSON.parse(text);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }

  return data;
}
