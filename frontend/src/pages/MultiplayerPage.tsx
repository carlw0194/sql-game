import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PlayerProfile from '../components/player/PlayerProfile';
import { getPlayerProfile } from '../services/gameService';
import { Player, MultiplayerMatch } from '../types';

/**
 * MultiplayerPage Component
 * 
 * This component implements the Multiplayer Mode of the SQL Scenario game.
 * It allows players to compete against each other in SQL challenges, either
 * in real-time duels or asynchronous competitions.
 * 
 * Key features:
 * 1. Match creation and joining
 * 2. Leaderboards and rankings
 * 3. Different competition formats (duels, tournaments)
 * 4. Real-time competition tracking
 * 
 * @returns {JSX.Element} The rendered multiplayer page
 */
const MultiplayerPage = () => {
  const navigate = useNavigate();
  
  // State for player data and loading status
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  
  // State for active and available matches
  const [activeMatches, setActiveMatches] = useState<MultiplayerMatch[]>([]);
  const [availableMatches, setAvailableMatches] = useState<MultiplayerMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  
  // State for match creation modal
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [matchType, setMatchType] = useState<'duel' | 'team'>('duel');
  
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
   * Loads active and available matches
   * In a real implementation, this would connect to a backend service
   */
  useEffect(() => {
    const loadMatches = async () => {
      setIsLoadingMatches(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for active matches
      const mockActiveMatches: MultiplayerMatch[] = [
        {
          id: 'match1',
          type: 'duel',
          status: 'in-progress',
          startTime: new Date().toISOString(),
          players: [
            { id: 'player1', name: 'SQLMaster', score: 85 },
            { id: 'player2', name: 'QueryNinja', score: 70 }
          ],
          challenge: {
            id: 'challenge1',
            title: 'Optimize Customer Query',
            description: 'Find the most efficient way to query customer data',
            scenario: 'As a database administrator, you need to optimize a query that is running slowly in production.',
            initialQuery: 'SELECT * FROM customers WHERE last_purchase > "2023-01-01"',
            schema: {
              tables: [
                {
                  name: 'customers',
                  columns: [
                    { name: 'id', type: 'INT', isPrimary: true },
                    { name: 'name', type: 'VARCHAR(100)' },
                    { name: 'last_purchase', type: 'DATE' }
                  ],
                  rowCount: 10000
                }
              ]
            },
            hints: ['Consider adding an index'],
            expectedSolution: {
              criteria: {
                maxExecutionTime: 0.5
              },
              sampleSolution: 'SELECT * FROM customers WHERE last_purchase > "2023-01-01" ORDER BY last_purchase DESC'
            }
          }
        }
      ];
      
      // Mock data for available matches
      const mockAvailableMatches: MultiplayerMatch[] = [
        {
          id: 'match2',
          type: 'duel',
          status: 'waiting',
          players: [
            { id: 'player3', name: 'DBWizard' }
          ],
          challenge: {
            id: 'challenge2',
            title: 'Join Optimization Challenge',
            description: 'Optimize a complex join query',
            scenario: 'You need to find the most efficient way to join multiple tables.',
            initialQuery: 'SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id',
            schema: {
              tables: [
                {
                  name: 'orders',
                  columns: [
                    { name: 'id', type: 'INT', isPrimary: true },
                    { name: 'customer_id', type: 'INT', isForeign: true, references: 'customers.id' },
                    { name: 'order_date', type: 'DATE' }
                  ],
                  rowCount: 5000
                },
                {
                  name: 'customers',
                  columns: [
                    { name: 'id', type: 'INT', isPrimary: true },
                    { name: 'name', type: 'VARCHAR(100)' },
                    { name: 'email', type: 'VARCHAR(100)' }
                  ],
                  rowCount: 1000
                }
              ]
            },
            hints: ['Consider the order of joins', 'Think about which table should be first'],
            expectedSolution: {
              criteria: {
                maxExecutionTime: 0.8
              },
              sampleSolution: 'SELECT o.id, c.name FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.order_date > "2023-01-01"'
            }
          }
        },
        {
          id: 'match3',
          type: 'team',
          status: 'waiting',
          players: [
            { id: 'player4', name: 'SQLPro' },
            { id: 'player5', name: 'QueryMaster' }
          ],
          challenge: {
            id: 'challenge3',
            title: 'Advanced Indexing',
            description: 'Create the right indexes for optimal performance',
            scenario: 'Your database is experiencing slow queries. Create the appropriate indexes to speed things up.',
            initialQuery: 'SELECT * FROM products WHERE category = "Electronics" AND price > 100',
            schema: {
              tables: [
                {
                  name: 'products',
                  columns: [
                    { name: 'id', type: 'INT', isPrimary: true },
                    { name: 'name', type: 'VARCHAR(100)' },
                    { name: 'category', type: 'VARCHAR(50)' },
                    { name: 'price', type: 'DECIMAL(10,2)' }
                  ],
                  rowCount: 10000
                }
              ]
            },
            hints: ['Consider a composite index', 'Think about column order in the index'],
            expectedSolution: {
              criteria: {
                mustUseIndex: true
              },
              sampleSolution: 'CREATE INDEX idx_category_price ON products(category, price); SELECT * FROM products WHERE category = "Electronics" AND price > 100'
            }
          }
        }
      ];
      
      setActiveMatches(mockActiveMatches);
      setAvailableMatches(mockAvailableMatches);
      setIsLoadingMatches(false);
    };
    
    loadMatches();
  }, []);
  
  /**
   * Opens the match creation modal
   */
  const openCreateMatchModal = () => {
    setIsCreatingMatch(true);
  };
  
  /**
   * Closes the match creation modal
   */
  const closeCreateMatchModal = () => {
    setIsCreatingMatch(false);
  };
  
  /**
   * Creates a new multiplayer match
   * In a real implementation, this would connect to a backend service
   */
  const createMatch = () => {
    // Mock implementation - would connect to backend in real app
    alert(`New ${matchType} match created!`);
    closeCreateMatchModal();
    
    // In a real implementation, this would add the new match to the available matches list
  };
  
  /**
   * Joins an existing match
   * @param {string} matchId - The ID of the match to join
   */
  const joinMatch = (matchId: string) => {
    // Mock implementation - would connect to backend in real app
    alert(`Joined match ${matchId}!`);
    
    // In a real implementation, this would navigate to the match screen
    // navigate(`/multiplayer/match/${matchId}`);
  };
  
  /**
   * Continues an active match
   * @param {string} matchId - The ID of the match to continue
   */
  const continueMatch = (matchId: string) => {
    // Mock implementation - would connect to backend in real app
    alert(`Continuing match ${matchId}!`);
    
    // In a real implementation, this would navigate to the match screen
    // navigate(`/multiplayer/match/${matchId}`);
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Multiplayer Mode</h1>
        <p className="text-gray-300">
          Compete against other players in real-time SQL challenges to test your skills and climb the leaderboards.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Player profile */}
        <div className="lg:col-span-1">
          {isLoadingPlayer ? (
            <div className="card flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : player ? (
            <PlayerProfile player={player} showSkills={true} showBadges={false} />
          ) : (
            <div className="card">
              <p className="text-gray-400">Failed to load player data</p>
            </div>
          )}
          
          {/* Multiplayer stats */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400 mb-1">Matches Played</div>
                <div className="text-lg">12</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-lg">75%</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400 mb-1">Rank</div>
                <div className="text-lg">Silver</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400 mb-1">Rating</div>
                <div className="text-lg">1250</div>
              </div>
            </div>
            
            <div className="mt-4">
              <button 
                className="btn-primary w-full"
                onClick={openCreateMatchModal}
              >
                Create New Match
              </button>
            </div>
          </div>
        </div>
        
        {/* Right column - Matches */}
        <div className="lg:col-span-2">
          {/* Active matches */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Active Matches</h2>
            
            {isLoadingMatches ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : activeMatches.length > 0 ? (
              <div className="space-y-4">
                {activeMatches.map(match => (
                  <div 
                    key={match.id}
                    className="bg-gray-800 p-4 rounded flex flex-col md:flex-row justify-between"
                  >
                    <div>
                      <h3 className="font-medium mb-1">{match.challenge.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {match.type === 'duel' ? 'Duel' : 'Team Match'} • Started {match.startTime && new Date(match.startTime).toLocaleTimeString()}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {match.players.map(player => (
                          <span 
                            key={player.id}
                            className={`text-sm px-2 py-1 rounded ${player.id === 'player1' ? 'bg-primary bg-opacity-20 text-primary' : 'bg-gray-700'}`}
                          >
                            {player.name} {player.score !== undefined && `(${player.score})`}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3 md:mt-0 md:ml-4 flex items-center">
                      <button 
                        className="btn-primary"
                        onClick={() => continueMatch(match.id)}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">You don't have any active matches</p>
            )}
          </div>
          
          {/* Available matches */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Available Matches</h2>
            
            {isLoadingMatches ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : availableMatches.length > 0 ? (
              <div className="space-y-4">
                {availableMatches.map(match => (
                  <div 
                    key={match.id}
                    className="bg-gray-800 p-4 rounded flex flex-col md:flex-row justify-between"
                  >
                    <div>
                      <h3 className="font-medium mb-1">{match.challenge.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {match.type === 'duel' ? 'Duel' : 'Team Match'} • Waiting for players
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {match.players.map(player => (
                          <span 
                            key={player.id}
                            className="text-sm px-2 py-1 rounded bg-gray-700"
                          >
                            {player.name}
                          </span>
                        ))}
                        
                        {match.type === 'duel' && match.players.length < 2 && (
                          <span className="text-sm px-2 py-1 rounded bg-gray-700 border border-dashed border-gray-600">
                            Waiting for opponent
                          </span>
                        )}
                        
                        {match.type === 'team' && match.players.length < 4 && (
                          <span className="text-sm px-2 py-1 rounded bg-gray-700 border border-dashed border-gray-600">
                            {4 - match.players.length} spots remaining
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 md:mt-0 md:ml-4 flex items-center">
                      <button 
                        className="btn-secondary"
                        onClick={() => joinMatch(match.id)}
                      >
                        Join Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No available matches found</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Match creation modal */}
      {isCreatingMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Create New Match</h2>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Match Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="matchType"
                      value="duel"
                      checked={matchType === 'duel'}
                      onChange={() => setMatchType('duel')}
                      className="mr-2"
                    />
                    Duel (1v1)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="matchType"
                      value="team"
                      checked={matchType === 'team'}
                      onChange={() => setMatchType('team')}
                      className="mr-2"
                    />
                    Team (2v2)
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Challenge Type
                </label>
                <select className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="random">Random Challenge</option>
                  <option value="optimization">Query Optimization</option>
                  <option value="indexing">Indexing Challenge</option>
                  <option value="joins">Complex Joins</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Difficulty
                </label>
                <select className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Time Limit
                </label>
                <select className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="0">No time limit</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button 
                className="btn-secondary"
                onClick={closeCreateMatchModal}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={createMatch}
              >
                Create Match
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MultiplayerPage;
