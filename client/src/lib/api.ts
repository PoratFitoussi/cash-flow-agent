const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

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
    console.error("Backend Error Details:", error);
    
    // Create a more descriptive error message combining the status and backend message
    const errorMsg = error.error || error.message || error.details?.errorMessage || `HTTP ${response.status} - API Request Failed`;
    throw new Error(errorMsg);
  }

  return response.json();
}
