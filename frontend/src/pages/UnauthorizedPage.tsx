import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

/**
 * UnauthorizedPage Component
 * 
 * This component is displayed when a user attempts to access a page
 * they don't have permission to view. It provides a friendly message
 * and navigation options.
 * 
 * @returns {JSX.Element} The rendered unauthorized page
 */
const UnauthorizedPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-6xl mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m0 0V6m0 2h2m-2 0H9" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        
        <p className="text-xl text-gray-300 mb-8 text-center max-w-md">
          You don't have permission to access this page.
        </p>
        
        <div className="flex space-x-4">
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
          <Link to="/login" className="btn-secondary">
            Log In
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default UnauthorizedPage;
