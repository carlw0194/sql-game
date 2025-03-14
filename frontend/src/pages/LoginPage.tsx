import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';

/**
 * LoginPage Component
 * 
 * This component provides a user interface for authentication.
 * It handles form submission, validation, and error display.
 * 
 * Security features:
 * - Input validation
 * - Error handling
 * - CSRF protection (token will be implemented with backend)
 * - Rate limiting feedback
 * 
 * @returns {JSX.Element} The rendered login page
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  /**
   * Validates the form inputs
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    // Clear previous errors
    clearError();
    
    // Validate email
    if (!email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  /**
   * Handles form submission
   * @param {FormEvent} e - Form event
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }
    
    try {
      // Attempt to log in
      await login(email, password);
      
      // Navigate to the redirect path after successful login
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login failed:', err);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6 text-center">Log in to SQL Scenario</h1>
            
            {/* Display authentication error */}
            {error && (
              <div className="bg-red-900 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Email field */}
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full p-2 bg-gray-800 border rounded ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
              
              {/* Password field */}
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`w-full p-2 bg-gray-800 border rounded ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>
              
              {/* Remember me checkbox */}
              <div className="flex items-center mb-4">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              
              {/* Submit button */}
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
              
              {/* Forgot password link */}
              <div className="mt-4 text-center">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </form>
            
            {/* Sign up link */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
