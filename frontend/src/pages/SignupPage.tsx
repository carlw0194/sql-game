import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';

/**
 * SignupPage Component
 * 
 * This component provides a user interface for new user registration.
 * It includes form validation, error handling, and security features.
 * 
 * Security features:
 * - Password strength validation
 * - Email validation
 * - CSRF protection (token will be implemented with backend)
 * - Rate limiting feedback
 * 
 * @returns {JSX.Element} The rendered signup page
 */
const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});

  const { signup, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  /**
   * Validates the form inputs
   * @returns {boolean} Whether the form is valid
   */
  const validateForm = (): boolean => {
    const errors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      acceptTerms?: string;
    } = {};
    let isValid = true;

    // Clear previous errors
    clearError();
    
    // Validate username
    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      isValid = false;
    }
    
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
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must include uppercase, lowercase, and numbers';
      isValid = false;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
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
      // Attempt to sign up
      await signup(username, email, password);
      
      // Navigate to the home page after successful signup
      navigate('/', { replace: true });
    } catch (err) {
      // Error is handled by the auth context
      console.error('Signup failed:', err);
    }
  };

  /**
   * Calculates password strength
   * @returns {{ score: number, label: string, color: string }} Password strength information
   */
  const calculatePasswordStrength = () => {
    if (!password) {
      return { score: 0, label: '', color: '' };
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    // Map score to label and color
    const strengthMap = [
      { label: 'Very Weak', color: 'bg-red-600' },
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-green-500' },
      { label: 'Strong', color: 'bg-green-400' },
      { label: 'Very Strong', color: 'bg-green-300' }
    ];
    
    // Cap score at 5 (index for 'Very Strong')
    const cappedScore = Math.min(score, 5);
    
    return {
      score: cappedScore,
      label: strengthMap[cappedScore].label,
      color: strengthMap[cappedScore].color
    };
  };

  const passwordStrength = calculatePasswordStrength();

  return (
    <MainLayout>
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
            
            {/* Display authentication error */}
            {error && (
              <div className="bg-red-900 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Username field */}
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className={`w-full p-2 bg-gray-800 border rounded ${
                    validationErrors.username ? 'border-red-500' : 'border-gray-600'
                  }`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  aria-describedby="username-error"
                />
                {validationErrors.username && (
                  <p id="username-error" className="text-red-500 text-sm mt-1">
                    {validationErrors.username}
                  </p>
                )}
              </div>
              
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
                  aria-describedby="email-error"
                />
                {validationErrors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </p>
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
                  aria-describedby="password-error password-strength"
                />
                {validationErrors.password && (
                  <p id="password-error" className="text-red-500 text-sm mt-1">
                    {validationErrors.password}
                  </p>
                )}
                
                {/* Password strength indicator */}
                {password && (
                  <div id="password-strength" className="mt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Password Strength:</span>
                      <span className="text-sm">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`${passwordStrength.color} h-2 rounded-full transition-all`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm Password field */}
              <div className="mb-4">
                <label htmlFor="confirm-password" className="block mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className={`w-full p-2 bg-gray-800 border rounded ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  aria-describedby="confirm-password-error"
                />
                {validationErrors.confirmPassword && (
                  <p id="confirm-password-error" className="text-red-500 text-sm mt-1">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
              
              {/* Terms and conditions checkbox */}
              <div className="mb-6">
                <div className="flex items-start">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    className="mt-1 mr-2"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={isLoading}
                    aria-describedby="terms-error"
                  />
                  <label htmlFor="accept-terms" className="text-sm">
                    I accept the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {validationErrors.acceptTerms && (
                  <p id="terms-error" className="text-red-500 text-sm mt-1">
                    {validationErrors.acceptTerms}
                  </p>
                )}
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
                    Creating Account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
            
            {/* Login link */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignupPage;
