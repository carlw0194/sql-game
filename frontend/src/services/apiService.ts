/**
 * API Service
 * 
 * This service handles all API requests to the backend, providing a centralized
 * place for request configuration, error handling, and security features.
 * 
 * Security features:
 * - CSRF token handling
 * - Authorization headers
 * - Request/response interceptors
 * - Error normalization
 * - Request timeout
 * - Rate limiting handling
 */

// Define API error types for better error handling
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Handles API requests with proper error handling and security features
 * 
 * @param {string} endpoint - API endpoint to call
 * @param {object} options - Request options
 * @returns {Promise<any>} Response data
 * @throws {ApiError|NetworkError|TimeoutError} Standardized error objects
 */
export const apiRequest = async (
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}
): Promise<any> => {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = 30000 // Default timeout: 30 seconds
  } = options;

  // Get the API base URL from environment variables or use a default
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const url = `${apiUrl}${endpoint}`;

  // Get auth token from localStorage
  const token = localStorage.getItem('token');

  // Set up request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers
  };

  // Add authorization header if token exists
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Get CSRF token from cookie if available (for non-GET requests)
  if (method !== 'GET') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }
  }

  // Create request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies in the request
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Request to ${endpoint} timed out after ${timeout}ms`));
    }, timeout);
  });

  try {
    // Race the fetch against the timeout
    const response: Response = await Promise.race([
      fetch(url, requestOptions),
      timeoutPromise
    ]) as Response;

    // Handle HTTP error responses
    if (!response.ok) {
      let errorData;
      try {
        // Try to parse error response as JSON
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use text response
        errorData = { message: await response.text() };
      }

      throw new ApiError(
        errorData.message || `API error: ${response.status} ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    // Rethrow ApiError, TimeoutError
    if (error instanceof ApiError || error instanceof TimeoutError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network error: Unable to connect to the server');
    }

    // Handle other errors
    throw new Error(`Unexpected error: ${(error as Error).message}`);
  }
};

/**
 * Gets the CSRF token from cookies
 * @returns {string|null} CSRF token or null if not found
 */
const getCsrfToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * API endpoints for the application
 */
export const api = {
  // Authentication endpoints
  auth: {
    login: (email: string, password: string) => 
      apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
    signup: (username: string, email: string, password: string) => 
      apiRequest('/auth/signup', { method: 'POST', body: { username, email, password } }),
    logout: () => 
      apiRequest('/auth/logout', { method: 'POST' }),
    refreshToken: () => 
      apiRequest('/auth/refresh', { method: 'POST' }),
    forgotPassword: (email: string) => 
      apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (token: string, password: string) => 
      apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } }),
  },

  // User profile endpoints
  user: {
    getProfile: () => 
      apiRequest('/user/profile'),
    updateProfile: (data: any) => 
      apiRequest('/user/profile', { method: 'PUT', body: data }),
    changePassword: (currentPassword: string, newPassword: string) => 
      apiRequest('/user/change-password', { 
        method: 'POST', 
        body: { currentPassword, newPassword } 
      }),
  },

  // Game data endpoints
  game: {
    getLevelClusters: () => 
      apiRequest('/game/level-clusters'),
    getLevel: (levelId: number) => 
      apiRequest(`/game/levels/${levelId}`),
    submitSolution: (levelId: number, query: string) => 
      apiRequest(`/game/levels/${levelId}/submit`, { 
        method: 'POST', 
        body: { query } 
      }),
    getDatasets: () => 
      apiRequest('/game/datasets'),
    executeQuery: (datasetId: string, query: string) => 
      apiRequest(`/game/datasets/${datasetId}/execute`, { 
        method: 'POST', 
        body: { query } 
      }),
  },

  // Leaderboard endpoints
  leaderboard: {
    getGlobal: (limit: number = 10) => 
      apiRequest(`/leaderboard/global?limit=${limit}`),
    getFriends: (limit: number = 10) => 
      apiRequest(`/leaderboard/friends?limit=${limit}`),
  },

  // Multiplayer endpoints
  multiplayer: {
    getMatches: () => 
      apiRequest('/multiplayer/matches'),
    createMatch: (type: 'duel' | 'team') => 
      apiRequest('/multiplayer/matches', { method: 'POST', body: { type } }),
    joinMatch: (matchId: string) => 
      apiRequest(`/multiplayer/matches/${matchId}/join`, { method: 'POST' }),
    submitSolution: (matchId: string, query: string) => 
      apiRequest(`/multiplayer/matches/${matchId}/submit`, { 
        method: 'POST', 
        body: { query } 
      }),
  },
};

export default api;
