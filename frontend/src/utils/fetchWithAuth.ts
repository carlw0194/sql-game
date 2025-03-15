/**
 * Authenticated Fetch Utility
 * 
 * This utility function wraps the standard fetch API to include authentication
 * headers and handle common API request patterns. It automatically adds the
 * Authorization header with the provided token and sets the base URL.
 * 
 * Usage example:
 * ```
 * // Get request with authentication
 * const response = await fetchWithAuth('/api/endpoint', token);
 * const data = await response.json();
 * 
 * // Post request with authentication and body
 * const response = await fetchWithAuth('/api/endpoint', token, {
 *   method: 'POST',
 *   body: JSON.stringify({ key: 'value' })
 * });
 * ```
 */

/**
 * Base API URL
 * 
 * This is the base URL for all API requests. In a production environment,
 * this would typically be loaded from an environment variable.
 */
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetch with authentication
 * 
 * Makes an authenticated fetch request to the API.
 * 
 * @param endpoint - The API endpoint to fetch from (without the base URL)
 * @param token - The authentication token
 * @param options - Additional fetch options (method, body, etc.)
 * @returns Promise with the fetch response
 */
export const fetchWithAuth = async (
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> => {
  // Ensure endpoint starts with a slash
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Prepare headers with authentication
  const headers = new Headers(options.headers || {});
  
  // Add content type if not present and we're sending JSON
  if (!headers.has('Content-Type') && options.body && 
      !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add authorization header if token is provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Combine all options
  const fetchOptions: RequestInit = {
    ...options,
    headers
  };
  
  try {
    // Make the request
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, fetchOptions);
    
    // Log API errors for debugging
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, await response.clone().text());
    }
    
    return response;
  } catch (error) {
    // Log network errors
    console.error('Network Error:', error);
    throw error;
  }
};

/**
 * Simple fetch without authentication
 * 
 * Makes a fetch request to the API without authentication.
 * Useful for public endpoints like login or registration.
 * 
 * @param endpoint - The API endpoint to fetch from (without the base URL)
 * @param options - Additional fetch options (method, body, etc.)
 * @returns Promise with the fetch response
 */
export const fetchWithoutAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetchWithAuth(endpoint, null, options);
};

export default fetchWithAuth;
