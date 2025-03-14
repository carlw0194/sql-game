import { useEffect } from 'react';
import { useError, AppError } from '../../context/ErrorContext';

/**
 * ErrorNotification Component
 * 
 * This component displays error notifications to users in a consistent format.
 * It automatically shows and hides notifications based on the error context state.
 * 
 * Key features:
 * 1. Different styling based on error severity
 * 2. Automatic dismissal for non-critical errors
 * 3. Retry functionality for applicable errors
 * 4. Accessibility support with proper ARIA attributes
 * 5. Animation for smooth appearance and disappearance
 * 
 * The component uses the ErrorContext to access and manage errors.
 * 
 * @returns {React.ReactElement} The rendered error notification component
 */
const ErrorNotification = () => {
  const { errors, removeError } = useError();

  // Automatically dismiss non-critical errors after a timeout
  useEffect(() => {
    const timeouts: number[] = [];
    
    errors.forEach(error => {
      // Only auto-dismiss info and warning severity errors
      if (error.severity === 'info' || error.severity === 'warning') {
        const timeout = setTimeout(() => {
          removeError(error.id);
        }, 5000); // 5 seconds
        
        timeouts.push(timeout);
      }
    });
    
    // Clean up timeouts on unmount
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [errors, removeError]);

  /**
   * Gets the appropriate background color class based on error severity
   * @param {AppError} error - The error to get the color for
   * @returns {string} Tailwind CSS class for the background color
   */
  const getBackgroundColor = (error: AppError): string => {
    switch (error.severity) {
      case 'info':
        return 'bg-blue-700';
      case 'warning':
        return 'bg-yellow-700';
      case 'critical':
        return 'bg-red-800';
      case 'error':
      default:
        return 'bg-red-700';
    }
  };

  /**
   * Gets the appropriate icon based on error type and severity
   * @param {AppError} error - The error to get the icon for
   * @returns {React.ReactElement} SVG icon element
   */
  const getIcon = (error: AppError): React.ReactElement => {
    switch (error.severity) {
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'critical':
      case 'error':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // If there are no errors, don't render anything
  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full" role="alert" aria-live="assertive">
      {errors.map(error => (
        <div
          key={error.id}
          className={`${getBackgroundColor(error)} text-white p-4 rounded shadow-lg flex items-start animate-fade-in`}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(error)}
          </div>
          
          <div className="flex-1">
            <div className="font-bold">{error.message}</div>
            
            {error.details && (
              <div className="text-sm mt-1 text-white text-opacity-90">
                {error.details}
              </div>
            )}
            
            <div className="flex mt-2 space-x-2">
              {error.retry && (
                <button
                  onClick={async () => {
                    removeError(error.id);
                    try {
                      if (error.retry) {
                        await error.retry();
                      }
                    } catch (e) {
                      // Error handling is done by the retry function itself
                    }
                  }}
                  className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded"
                >
                  Retry
                </button>
              )}
              
              <button
                onClick={() => removeError(error.id)}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded"
                aria-label="Dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ErrorNotification;
