import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * ErrorBoundary Component
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 * 
 * Key features:
 * 1. Catches runtime errors in components
 * 2. Prevents the entire app from crashing
 * 3. Displays user-friendly error messages
 * 4. Logs detailed error information for debugging
 * 5. Provides options to recover from errors
 * 
 * Error boundaries do NOT catch errors in:
 * - Event handlers (use try/catch in the handler instead)
 * - Asynchronous code (e.g., setTimeout, requestAnimationFrame, promises)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 * 
 * @param {ErrorBoundaryProps} props - Component properties
 * @returns {JSX.Element} The rendered component or error UI
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error occurs
   * This is called during the "render" phase, so side effects are not allowed
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  /**
   * Log error information for debugging
   * This is called during the "commit" phase, so side effects are allowed
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // You could also send this to a logging service like Sentry
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  /**
   * Reset the error state to attempt recovery
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    // If there's an error, show the error UI
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-4">
          <div className="max-w-md w-full bg-surface rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-6xl mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-center">Something went wrong</h1>
            
            <div className="mb-4 p-3 bg-gray-800 rounded overflow-auto max-h-40">
              <p className="font-mono text-sm text-red-400">
                {this.state.error?.toString() || 'An unexpected error occurred'}
              </p>
            </div>
            
            <div className="flex flex-col space-y-3 mt-6">
              <button
                onClick={this.handleReset}
                className="btn-primary"
              >
                Try Again
              </button>
              
              <Link to="/" className="btn-secondary text-center">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
