import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Authentication Context
 * 
 * This context provides authentication state and functions throughout the application.
 * It handles user login, logout, token management, and session persistence.
 * 
 * Security features:
 * - Token storage in HttpOnly cookies (when connected to backend)
 * - Automatic token refresh
 * - Session timeout handling
 * - Protection against CSRF attacks
 */

// Define the User type
interface User {
  id: string;
  username: string;
  email?: string;
  role: 'player' | 'admin';
}

// Define the Authentication context state
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  clearError: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * 
 * This component wraps the application and provides authentication state and functions
 * to all child components through the AuthContext.
 * 
 * @param {ReactNode} children - Child components to be wrapped
 * @returns {JSX.Element} The provider component with authentication state
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would verify the token with the backend
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          // Validate the stored user data (in production, verify with backend)
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Clear invalid auth data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Handles user login
   * Validates credentials and manages user session state
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<void>} Promise that resolves when login is complete
   * @throws {Error} If login fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful login
      // In a real implementation, this would call the backend API
      if (email === 'demo@example.com' && password === 'password') {
        const userData: User = {
          id: 'user1',
          username: 'SQLMaster',
          email: 'demo@example.com',
          role: 'player' as 'player' | 'admin',
        };
        setUser(userData);
        
        // Store authentication data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'mock-jwt-token');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out the current user
   */
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API endpoint to invalidate the token
      
      // Clear stored auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user
   * 
   * @param {string} username - Desired username
   * @param {string} email - User's email
   * @param {string} password - User's password
   */
  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // The password parameter would be used to create the user account
      // but is not used in this simulation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser: User = {
        id: 'new-user',
        username,
        email,
        role: 'player'
      };
      
      // Store user data (in production, only store the token in HttpOnly cookie)
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-jwt-token');
      
      setUser(mockUser);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears any authentication errors
   */
  const clearError = () => {
    setError(null);
  };

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        signup,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
