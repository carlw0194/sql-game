import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getPlayerProfile } from '../services/gameService';
import { Player } from '../types';

/**
 * ChallengeResultsPage Component
 * 
 * This component displays detailed results after a player completes a SQL challenge.
 * It provides feedback on query performance, correctness, and areas for improvement.
 * 
 * Key features:
 * 1. Performance metrics visualization
 * 2. Comparison with optimal solution
 * 3. XP and rewards earned
 * 4. Suggestions for improvement
 * 5. Next challenge recommendations
 * 
 * The results help players understand their strengths and weaknesses,
 * encouraging them to improve their SQL skills through targeted practice.
 * 
 * @returns {JSX.Element} The rendered challenge results page
 */
const ChallengeResultsPage = () => {
  // Get challenge ID from URL params
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  
  // State for player data
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  
  // State for challenge results
  const [results, setResults] = useState<ChallengeResults | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  
  // Define challenge results type
  type ChallengeResults = {
    challengeId: string;
    challengeTitle: string;
    playerQuery: string;
    optimalQuery: string;
    executionTime: number;
    optimalExecutionTime: number;
    correctness: number; // Percentage correct
    performanceScore: number; // Percentage of optimal
    overallScore: number; // Combined score
    xpEarned: number;
    badgesEarned: string[];
    feedback: string[];
    executionPlan: {
      playerPlan: string;
      optimalPlan: string;
      improvements: string[];
    };
    nextChallenges: {
      id: string;
      title: string;
      difficulty: string;
    }[];
  };
  
  /**
   * Loads the player profile data
   * In a real implementation, this would connect to a backend service
   */
  useEffect(() => {
    const loadPlayerData = async () => {
      setIsLoadingPlayer(true);
      try {
        const data = await getPlayerProfile();
        setPlayer(data);
      } catch (error) {
        console.error('Error loading player data:', error);
      } finally {
        setIsLoadingPlayer(false);
      }
    };
    
    loadPlayerData();
  }, []);
  
  /**
   * Loads challenge results data
   * In a real implementation, this would connect to a backend service
   */
  useEffect(() => {
    const loadChallengeResults = async () => {
      if (!challengeId) return;
      
      setIsLoadingResults(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock challenge results data
        const mockResults: ChallengeResults = {
          challengeId: challengeId,
          challengeTitle: "Optimize Customer Orders Query",
          playerQuery: "SELECT c.customer_id, c.name, COUNT(o.order_id) as order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_date > '2023-01-01' GROUP BY c.customer_id, c.name ORDER BY order_count DESC LIMIT 10",
          optimalQuery: "SELECT c.customer_id, c.name, COUNT(o.order_id) as order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_date > '2023-01-01' GROUP BY c.customer_id, c.name ORDER BY COUNT(o.order_id) DESC LIMIT 10",
          executionTime: 1.2,
          optimalExecutionTime: 0.8,
          correctness: 100,
          performanceScore: 85,
          overallScore: 92,
          xpEarned: 250,
          badgesEarned: ["Query Optimizer"],
          feedback: [
            "Your query correctly returns the top 10 customers with the most orders since 2023.",
            "The JOIN condition and WHERE clause are optimal.",
            "Using COUNT(o.order_id) directly in the ORDER BY clause could improve performance slightly.",
            "Consider adding an index on orders.order_date to further optimize this query."
          ],
          executionPlan: {
            playerPlan: "Sort (cost=352.43..354.93 rows=1000 width=72)\n  Sort Key: (count(o.order_id)) DESC\n  ->  HashAggregate (cost=285.20..295.20 rows=1000 width=72)\n        Group Key: c.customer_id, c.name\n        ->  Hash Join (cost=85.50..260.20 rows=5000 width=40)\n              Hash Cond: (o.customer_id = c.customer_id)\n              ->  Seq Scan on orders o (cost=0.00..148.00 rows=5000 width=8)\n                    Filter: (order_date > '2023-01-01'::date)\n              ->  Hash (cost=70.00..70.00 rows=1000 width=36)\n                    ->  Seq Scan on customers c (cost=0.00..70.00 rows=1000 width=36)",
            optimalPlan: "Sort (cost=342.43..344.93 rows=1000 width=72)\n  Sort Key: (count(o.order_id)) DESC\n  ->  HashAggregate (cost=275.20..285.20 rows=1000 width=72)\n        Group Key: c.customer_id, c.name\n        ->  Hash Join (cost=85.50..250.20 rows=5000 width=40)\n              Hash Cond: (o.customer_id = c.customer_id)\n              ->  Index Scan using idx_orders_date on orders o (cost=0.00..138.00 rows=5000 width=8)\n                    Filter: (order_date > '2023-01-01'::date)\n              ->  Hash (cost=70.00..70.00 rows=1000 width=36)\n                    ->  Seq Scan on customers c (cost=0.00..70.00 rows=1000 width=36)",
            improvements: [
              "Using an index on orders.order_date would avoid a sequential scan",
              "The optimal query uses a more efficient sort operation",
              "Overall cost reduced by approximately 10%"
            ]
          },
          nextChallenges: [
            {
              id: "challenge123",
              title: "Advanced Customer Segmentation",
              difficulty: "Intermediate"
            },
            {
              id: "challenge124",
              title: "Order Fulfillment Optimization",
              difficulty: "Advanced"
            },
            {
              id: "challenge125",
              title: "Customer Lifetime Value Analysis",
              difficulty: "Intermediate"
            }
          ]
        };
        
        setResults(mockResults);
      } catch (error) {
        console.error('Error loading challenge results:', error);
      } finally {
        setIsLoadingResults(false);
      }
    };
    
    loadChallengeResults();
  }, [challengeId]);
  
  /**
   * Navigates to the next challenge
   * @param {string} nextChallengeId - The ID of the next challenge
   */
  const goToNextChallenge = (nextChallengeId: string) => {
    navigate(`/level/${nextChallengeId}`);
  };
  
  /**
   * Returns to the career mode page
   */
  const returnToCareerMode = () => {
    navigate('/career');
  };
  
  /**
   * Calculates the color class based on a score percentage
   * @param {number} score - The score percentage (0-100)
   * @returns {string} The appropriate color class
   */
  const getScoreColorClass = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <button 
          className="text-gray-400 hover:text-white flex items-center mb-4"
          onClick={returnToCareerMode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Career Mode
        </button>
        
        <h1 className="text-3xl font-bold mb-2">Challenge Results</h1>
        {results && (
          <p className="text-gray-300">
            {results.challengeTitle}
          </p>
        )}
      </div>
      
      {isLoadingResults ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : results ? (
        <div className="space-y-6">
          {/* Overall score card */}
          <div className="card">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold mr-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-opacity-50"></div>
                  <span className={getScoreColorClass(results.overallScore)}>{results.overallScore}</span>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-1">Challenge Completed!</h2>
                  <p className="text-gray-300 mb-2">You've earned {results.xpEarned} XP</p>
                  
                  {results.badgesEarned.length > 0 && (
                    <div className="flex flex-wrap">
                      {results.badgesEarned.map(badge => (
                        <span 
                          key={badge}
                          className="text-xs px-2 py-1 rounded bg-primary bg-opacity-20 text-primary mr-2"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-sm text-gray-400 mb-1">Your Level</div>
                <div className="text-2xl font-bold">
                  {player?.level || '?'}
                </div>
                
                {player && (
                  <div className="w-32 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(player.xp % 1000) / 10}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Performance metrics */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded">
                <div className="text-sm text-gray-400 mb-1">Correctness</div>
                <div className="text-2xl font-bold mb-1 flex items-center">
                  <span className={getScoreColorClass(results.correctness)}>{results.correctness}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${results.correctness >= 90 ? 'bg-green-500' : results.correctness >= 70 ? 'bg-blue-500' : results.correctness >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${results.correctness}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <div className="text-sm text-gray-400 mb-1">Performance</div>
                <div className="text-2xl font-bold mb-1 flex items-center">
                  <span className={getScoreColorClass(results.performanceScore)}>{results.performanceScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${results.performanceScore >= 90 ? 'bg-green-500' : results.performanceScore >= 70 ? 'bg-blue-500' : results.performanceScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${results.performanceScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded">
                <div className="text-sm text-gray-400 mb-1">Execution Time</div>
                <div className="text-2xl font-bold mb-1">
                  {results.executionTime}s
                  <span className="text-sm text-gray-400 ml-2">
                    (Optimal: {results.optimalExecutionTime}s)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(results.optimalExecutionTime / results.executionTime) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Feedback</h3>
            <ul className="list-disc list-inside space-y-1 mb-6">
              {results.feedback.map((item, index) => (
                <li key={index} className="text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
          
          {/* Query comparison */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Query Comparison</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Query</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{results.playerQuery}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Optimal Query</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{results.optimalQuery}</pre>
                </div>
              </div>
            </div>
          </div>
          
          {/* Execution plan */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Execution Plan Analysis</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Execution Plan</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto h-64 overflow-y-auto">
                  <pre className="whitespace-pre">{results.executionPlan.playerPlan}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Optimal Execution Plan</h3>
                <div className="bg-gray-800 p-4 rounded font-mono text-sm overflow-x-auto h-64 overflow-y-auto">
                  <pre className="whitespace-pre">{results.executionPlan.optimalPlan}</pre>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Suggested Improvements</h3>
            <ul className="list-disc list-inside space-y-1">
              {results.executionPlan.improvements.map((item, index) => (
                <li key={index} className="text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
          
          {/* Next challenges */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Continue Your Journey</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {results.nextChallenges.map(challenge => (
                <div 
                  key={challenge.id}
                  className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => goToNextChallenge(challenge.id)}
                >
                  <h3 className="font-medium mb-1">{challenge.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Difficulty: {challenge.difficulty}
                  </p>
                  <button className="text-primary text-sm flex items-center">
                    Start Challenge
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between">
            <button 
              className="btn-secondary"
              onClick={returnToCareerMode}
            >
              Return to Career Mode
            </button>
            
            <button 
              className="btn-primary"
              onClick={() => goToNextChallenge(results.nextChallenges[0].id)}
            >
              Next Challenge
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="text-gray-400">Challenge results not found. Please try again or return to Career Mode.</p>
          <button 
            className="btn-primary mt-4"
            onClick={returnToCareerMode}
          >
            Return to Career Mode
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default ChallengeResultsPage;
