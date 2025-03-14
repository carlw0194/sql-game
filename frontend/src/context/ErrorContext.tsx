import { createContext, useContext, useState, ReactNode } from 'react';
import { ApiError, NetworkError, TimeoutError } from '../services/apiService';

/**
 * Error Context
 * 
 * This context provides global error handling capabilities throughout the application.
 * It allows components to report errors and display error messages to users in a
 * consistent way, while also providing methods to handle and dismiss errors.
 * 
 * Key features:
 * 1. Centralized error state management
 * 2. Categorized error types (API, network, validation, etc.)
 * 3. Error severity levels
 * 4. Error dismissal and handling functions
 * 5. Error reporting to monitoring services
 * 
 * This context works alongside the ErrorBoundary component to provide
 * comprehensive error handling throughout the application.
 */

// Define error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Define application error structure
export interface AppError {
  id: string;
  message: string;
  details?: string;
  type: 'api' | 'network' | 'validation' | 'auth' | 'unknown';
  severity: ErrorSeverity;
  timestamp: Date;
  field?: string; // For validation errors
  statusCode?: number; // For API errors
  retry?: () => Promise<void>; // Function to retry the failed operation
}

// Define error context state and methods
interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasErrors: (type?: AppError['type']) => boolean;
}

// Create the context with default values
const ErrorContext = createContext<ErrorContextType>({
  errors: [],
  addError: () => '',
  removeError: () => {},
  clearErrors: () => {},
  hasErrors: () => false,
});

// Custom hook to use the error context
export const useError = () => useContext(ErrorContext);

interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * ErrorProvider Component
 * 
 * This component wraps the application and provides error handling state and functions
 * to all child components through the ErrorContext.
 * 
 * @param {ReactNode} children - Child components to be wrapped
 * @returns {JSX.Element} The provider component with error handling state
 */
export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  /**
   * Adds a new error to the error state
   * @param {Omit<AppError, 'id' | 'timestamp'>} error - Error to add
   * @returns {string} The ID of the added error
   */
  const addError = (error: Omit<AppError, 'id' | 'timestamp'>): string => {
    // Generate a unique ID for the error
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Create the complete error object
    const newError: AppError = {
      ...error,
      id,
      timestamp: new Date(),
    };
    
    // Add the error to state
    setErrors(prevErrors => [...prevErrors, newError]);
    
    // Log the error for debugging
    console.error('Application error:', newError);
    
    // Here you could also send the error to a monitoring service like Sentry
    // reportErrorToMonitoringService(newError);
    
    return id;
  };

  /**
   * Removes an error by ID
   * @param {string} id - ID of the error to remove
   */
  const removeError = (id: string): void => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== id));
  };

  /**
   * Clears all errors
   */
  const clearErrors = (): void => {
    setErrors([]);
  };

  /**
   * Checks if there are any errors of a specific type
   * @param {AppError['type']} type - Optional error type to check for
   * @returns {boolean} Whether there are errors of the specified type
   */
  const hasErrors = (type?: AppError['type']): boolean => {
    if (type) {
      return errors.some(error => error.type === type);
    }
    return errors.length > 0;
  };

  // Provide the error context to child components
  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        removeError,
        clearErrors,
        hasErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Converts various error types to a standardized AppError format
 * @param {unknown} error - The error to convert
 * @param {string} defaultMessage - Default message if none can be extracted
 * @returns {Omit<AppError, 'id' | 'timestamp'>} Standardized error object
 */
export const normalizeError = (
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): Omit<AppError, 'id' | 'timestamp'> => {
  // Handle ApiError
  if (error instanceof ApiError) {
    return {
      message: error.message,
      details: JSON.stringify(error.data),
      type: 'api',
      severity: error.status >= 500 ? 'critical' : 'error',
      statusCode: error.status,
    };
  }
  
  // Handle NetworkError
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      type: 'network',
      severity: 'error',
    };
  }
  
  // Handle TimeoutError
  if (error instanceof TimeoutError) {
    return {
      message: error.message,
      type: 'network',
      severity: 'warning',
    };
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
      type: 'unknown',
      severity: 'error',
    };
  }
  
  // Handle unknown error types
  return {
    message: defaultMessage,
    details: String(error),
    type: 'unknown',
    severity: 'error',
  };
};

export default ErrorContext;
