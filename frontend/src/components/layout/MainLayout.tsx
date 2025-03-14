import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * MainLayout Component
 * 
 * This component provides the primary layout structure for the SQL Scenario game.
 * It includes a consistent header, navigation, and footer across all pages.
 * 
 * @param {ReactNode} children - The content to be rendered within the layout
 * @returns {JSX.Element} The rendered layout with children
 */
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      {/* Header with game title and user info */}
      <header className="bg-surface shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">SQL Scenario</Link>
          
          {/* Navigation links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/career" className="hover:text-primary transition-colors">Career Mode</Link>
            <Link to="/sandbox" className="hover:text-primary transition-colors">Sandbox</Link>
            <Link to="/multiplayer" className="hover:text-primary transition-colors">Multiplayer</Link>
            <Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
          </nav>
          
          {/* User profile section */}
          <div className="flex items-center space-x-3">
            <span className="hidden md:inline">Welcome, Player!</span>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="font-bold">P</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer with additional links and info */}
      <footer className="bg-surface py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>SQL Scenario - Learn SQL through interactive gameplay</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/help" className="hover:text-primary">Help</Link>
            <Link to="/settings" className="hover:text-primary">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
