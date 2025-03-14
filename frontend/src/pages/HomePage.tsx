import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

/**
 * HomePage Component
 * 
 * This is the main landing page for the SQL Scenario game.
 * It provides navigation to the different game modes and displays the player's progress.
 * 
 * @returns {JSX.Element} The rendered home page
 */
const HomePage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - Welcome and game modes */}
        <div className="md:w-2/3">
          <div className="card mb-6">
            <h1 className="text-3xl font-bold mb-4">Welcome to SQL Scenario</h1>
            <p className="mb-4">
              Master SQL through interactive, scenario-based challenges. Progress through levels,
              solve real-world database problems, and become a database expert!
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Link to="/career" className="btn-primary">Start Career Mode</Link>
              <Link to="/sandbox" className="btn-secondary">Open Sandbox</Link>
            </div>
          </div>

          {/* Game modes section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Career Mode Card */}
            <div className="card hover:border hover:border-primary transition-all">
              <h2 className="text-xl font-semibold mb-2">Career Mode</h2>
              <p className="text-gray-300 mb-4">
                Progress through 500+ levels of SQL challenges, from basic queries to advanced enterprise scenarios.
              </p>
              <Link to="/career" className="text-primary hover:underline">
                Continue Level 1 →
              </Link>
            </div>

            {/* Sandbox Mode Card */}
            <div className="card hover:border hover:border-secondary transition-all">
              <h2 className="text-xl font-semibold mb-2">Sandbox Mode</h2>
              <p className="text-gray-300 mb-4">
                Practice SQL in an open environment with instant feedback and performance metrics.
              </p>
              <Link to="/sandbox" className="text-secondary hover:underline">
                Open Sandbox →
              </Link>
            </div>

            {/* Multiplayer Mode Card */}
            <div className="card hover:border hover:border-accent transition-all">
              <h2 className="text-xl font-semibold mb-2">Multiplayer</h2>
              <p className="text-gray-300 mb-4">
                Compete in SQL duels or collaborate on team challenges with other players.
              </p>
              <Link to="/multiplayer" className="text-accent hover:underline">
                Find Opponents →
              </Link>
            </div>

            {/* Leaderboard Card */}
            <div className="card hover:border hover:border-blue-400 transition-all">
              <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
              <p className="text-gray-300 mb-4">
                See how you rank against other players globally or among your friends.
              </p>
              <Link to="/leaderboard" className="text-blue-400 hover:underline">
                View Rankings →
              </Link>
            </div>
          </div>
        </div>

        {/* Right column - Player stats and daily challenge */}
        <div className="md:w-1/3">
          {/* Player Profile Card */}
          <div className="card mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold">P</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Player</h2>
                <p className="text-gray-300">Junior DBA (Level 1)</p>
              </div>
            </div>
            
            {/* Progress bars */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>XP Progress</span>
                  <span>0/1000</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Query Mastery</span>
                  <span>Beginner</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
            
            <Link to="/profile" className="text-primary hover:underline block text-center">
              View Full Profile
            </Link>
          </div>
          
          {/* Daily Challenge Card */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-2">Daily Challenge</h2>
            <p className="text-gray-300 mb-4">
              Optimize a slow-running e-commerce query to earn bonus XP and rewards!
            </p>
            <Link to="/daily-challenge" className="btn-primary w-full text-center">
              Accept Challenge
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
