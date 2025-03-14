import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Import page components
import HomePage from './pages/HomePage';
import CareerModePage from './pages/CareerModePage';
import SandboxPage from './pages/SandboxPage';
import LevelPage from './pages/LevelPage';
import MultiplayerPage from './pages/MultiplayerPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChallengeResultsPage from './pages/ChallengeResultsPage';
import ChallengePage from './pages/ChallengePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import ErrorNotification from './components/error/ErrorNotification';
import ApiTest from './components/tests/ApiTest';

/**
 * App Component
 * 
 * This is the main application component that sets up routing for the SQL Scenario game.
 * It uses React Router to navigate between different pages of the application.
 * 
 * The routing structure includes:
 * - Home page (landing page): Entry point for the application
 * - Authentication pages: Login and signup
 * - Career Mode: Progressive level-based learning path with structured challenges
 * - Sandbox Mode: Free-form SQL practice environment with various datasets
 * - Level Page: Individual level details and challenge interface
 * - Challenge Page: The main gameplay screen where players solve SQL challenges
 * - Challenge Results: Detailed feedback after completing a challenge
 * - Multiplayer Mode: Competitive SQL challenges against other players
 * - Leaderboard: Global and friend rankings to track progress and competition
 * - Settings Page: User preferences and configuration options
 * - API Test: Development tool to test frontend-backend integration
 * 
 * Protected routes require authentication, ensuring that only logged-in users
 * can access certain features of the application.
 * 
 * The application is wrapped with:
 * - ErrorBoundary: Catches JavaScript errors in the component tree
 * - ErrorProvider: Provides global error handling capabilities
 * - AuthProvider: Manages authentication state and functions
 * 
 * @returns {JSX.Element} The rendered application with routing configuration
 */
function App() {
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <AuthProvider>
          <Router>
            {/* Error notification component for displaying global errors */}
            <ErrorNotification />
            
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Development and testing routes */}
              <Route path="/api-test" element={<ApiTest />} />
              
              {/* Protected game mode routes */}
              <Route path="/career" element={
                <ProtectedRoute>
                  <CareerModePage />
                </ProtectedRoute>
              } />
              <Route path="/sandbox" element={
                <ProtectedRoute>
                  <SandboxPage />
                </ProtectedRoute>
              } />
              <Route path="/level/:levelId" element={
                <ProtectedRoute>
                  <LevelPage />
                </ProtectedRoute>
              } />
              <Route path="/challenge/:levelId" element={
                <ProtectedRoute>
                  <ChallengePage />
                </ProtectedRoute>
              } />
              <Route path="/challenge-results/:challengeId" element={
                <ProtectedRoute>
                  <ChallengeResultsPage />
                </ProtectedRoute>
              } />
              <Route path="/multiplayer" element={
                <ProtectedRoute>
                  <MultiplayerPage />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Fallback route - redirects to home if path doesn't match */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  );
}

export default App;
