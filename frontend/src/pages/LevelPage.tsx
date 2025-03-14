import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ChallengeScreen from '../components/game/ChallengeScreen';
import { getLevelById } from '../services/gameService';
import { Level } from '../types';
import { getDifficultyColor, formatExecutionTime } from '../utils/gameUtils';

/**
 * LevelPage Component
 * 
 * This component displays an individual level in the Career Mode, showing
 * the level details, challenge description, and allowing the player to
 * start the challenge.
 * 
 * The page has two main states:
 * 1. Level overview - Shows level information and a "Start Challenge" button
 * 2. Challenge mode - Shows the actual SQL challenge interface
 * 
 * @returns {JSX.Element} The rendered level page
 */
const LevelPage = () => {
  // Get the level ID from the URL parameters
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  
  // State for level data and loading status
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State to track if the challenge is active
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  
  // Load the level data when the component mounts or levelId changes
  useEffect(() => {
    const fetchLevel = async () => {
      if (!levelId) {
        setError('Level ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const levelData = await getLevelById(parseInt(levelId));
        if (levelData) {
          setLevel(levelData);
          setError(null);
        } else {
          setError('Level not found');
        }
      } catch (err) {
        setError('Failed to load level data');
        console.error('Error fetching level:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLevel();
  }, [levelId]);
  
  /**
   * Starts the challenge for this level
   */
  const startChallenge = () => {
    setIsChallengeActive(true);
  };
  
  /**
   * Returns to the career mode page
   */
  const goBackToCareer = () => {
    navigate('/career');
  };
  
  /**
   * Exits the current challenge and returns to the level overview
   */
  const exitChallenge = () => {
    // In a real implementation, we might want to confirm with the user
    // before exiting, especially if they have unsaved progress
    setIsChallengeActive(false);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  // Render error state
  if (error || !level) {
    return (
      <MainLayout>
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p>{error || 'Failed to load level'}</p>
          <button 
            className="btn-secondary mt-4"
            onClick={goBackToCareer}
          >
            Return to Career Mode
          </button>
        </div>
      </MainLayout>
    );
  }
  
  // If challenge is active, show the challenge screen
  if (isChallengeActive) {
    return (
      <MainLayout>
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{level.name}</h1>
          <button 
            className="btn-secondary"
            onClick={exitChallenge}
          >
            Exit Challenge
          </button>
        </div>
        
        <ChallengeScreen 
          title={level.challenge.title}
          description={level.challenge.scenario}
          schema={level.challenge.schema}
        />
      </MainLayout>
    );
  }
  
  // Otherwise, show the level overview
  return (
    <MainLayout>
      <div className="mb-6">
        <button 
          className="text-gray-400 hover:text-white flex items-center mb-4"
          onClick={goBackToCareer}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Career Mode
        </button>
        
        <h1 className="text-3xl font-bold mb-2">{level.name}</h1>
        <div className="flex items-center mb-4">
          <span className={`${getDifficultyColor(level.difficulty)} mr-3`}>
            {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
          </span>
          {level.completed && (
            <span className="bg-green-900 bg-opacity-30 text-green-400 px-2 py-1 rounded text-sm">
              Completed
            </span>
          )}
        </div>
        <p className="text-gray-300">{level.description}</p>
      </div>
      
      {/* Level challenge card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Challenge: {level.challenge.title}</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Scenario</h3>
          <p className="text-gray-300">{level.challenge.scenario}</p>
        </div>
        
        {/* Challenge details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {level.challenge.timeLimit && (
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Time Limit</div>
              <div className="text-lg">{formatExecutionTime(level.challenge.timeLimit)}</div>
            </div>
          )}
          
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Database Tables</div>
            <div className="text-lg">{level.challenge.schema.tables.length}</div>
          </div>
          
          {level.completed && level.score && (
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Your Best Score</div>
              <div className="text-lg">{level.score}/100</div>
            </div>
          )}
          
          {level.completed && level.bestTime && (
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400 mb-1">Your Best Time</div>
              <div className="text-lg">{formatExecutionTime(level.bestTime)}</div>
            </div>
          )}
        </div>
        
        {/* Database schema preview */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Database Schema</h3>
          <div className="bg-gray-800 p-4 rounded overflow-x-auto">
            <div className="flex space-x-6">
              {level.challenge.schema.tables.map(table => (
                <div key={table.name} className="min-w-[200px]">
                  <h4 className="font-medium mb-2 text-primary">{table.name}</h4>
                  <div className="text-sm">
                    {table.columns.map(column => (
                      <div key={column.name} className="flex justify-between py-1 border-b border-gray-700 last:border-0">
                        <span className="flex items-center">
                          {column.isPrimary && (
                            <span className="mr-1 text-yellow-500 text-xs">🔑</span>
                          )}
                          {column.isForeign && (
                            <span className="mr-1 text-blue-400 text-xs">🔗</span>
                          )}
                          {column.name}
                        </span>
                        <span className="text-gray-400">{column.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Start challenge button */}
        <div className="flex justify-center">
          <button 
            className="btn-primary px-8 py-3 text-lg"
            onClick={startChallenge}
          >
            {level.completed ? 'Retry Challenge' : 'Start Challenge'}
          </button>
        </div>
      </div>
      
      {/* Previous attempts section (if completed) */}
      {level.completed && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Previous Attempts</h2>
          
          {/* This would be populated with actual attempt data in a real implementation */}
          <div className="bg-gray-800 rounded overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Hints Used
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    2023-03-15
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {level.score}/100
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatExecutionTime(level.bestTime || 0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    1
                  </td>
                </tr>
                {/* More attempt rows would be shown here in a real implementation */}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default LevelPage;
