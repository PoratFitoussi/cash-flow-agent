const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Assume token is stored in localStorage or handled via context in a real app.
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API Request Failed');
  }

  return response.json();
}
