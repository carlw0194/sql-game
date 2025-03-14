import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getPlayerProfile } from '../services/gameService';
import { Player } from '../types';

/**
 * LeaderboardPage Component
 * 
 * This component displays rankings of players based on their performance in the game.
 * It allows users to view global leaderboards, friend rankings, and filter by region.
 * 
 * Key features:
 * 1. Multiple leaderboard types (global, friends, regional)
 * 2. Detailed player statistics (level, XP, badges)
 * 3. Player ranking visualization
 * 4. Filtering and sorting options
 * 
 * The leaderboard data is fetched from the backend service and displayed in a
 * tabular format with pagination for better performance with large datasets.
 * 
 * @returns {JSX.Element} The rendered leaderboard page
 */
const LeaderboardPage = () => {
  // State for current player data
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  
  // State for leaderboard data and filters
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'friends' | 'regional'>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState<string>('all');
  
  // Define leaderboard entry type
  type LeaderboardEntry = {
    rank: number;
    playerId: string;
    playerName: string;
    level: number;
    xp: number;
    badges: string[];
    avatarUrl?: string;
    isCurrentPlayer?: boolean;
    region?: string;
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
   * Loads leaderboard data based on selected type and filters
   * In a real implementation, this would connect to a backend service
   */
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setIsLoadingLeaderboard(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock leaderboard data
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            rank: 1,
            playerId: 'player1',
            playerName: 'SuperDBA',
            level: 50,
            xp: 50000,
            badges: ['Index-Pro', 'Query-Master', 'Security-Expert'],
            region: 'North America'
          },
          {
            rank: 2,
            playerId: 'player2',
            playerName: 'QueryMaster42',
            level: 48,
            xp: 47300,
            badges: ['Tuner', 'Join-Expert'],
            region: 'Europe'
          },
          {
            rank: 3,
            playerId: 'player3',
            playerName: 'DataHero',
            level: 47,
            xp: 46500,
            badges: ['Sec-Guru', 'Performance-Wizard'],
            region: 'Asia'
          },
          {
            rank: 4,
            playerId: 'player4',
            playerName: 'SQLWizard',
            level: 45,
            xp: 45200,
            badges: ['Index-Pro', 'Transaction-Master'],
            region: 'South America'
          },
          {
            rank: 5,
            playerId: 'player5',
            playerName: 'JoinMaster',
            level: 44,
            xp: 44800,
            badges: ['Join-Expert', 'Query-Optimizer'],
            region: 'Europe'
          },
          {
            rank: 6,
            playerId: 'player6',
            playerName: 'SchemaGuru',
            level: 43,
            xp: 43500,
            badges: ['Schema-Designer', 'Normalization-Expert'],
            region: 'North America'
          },
          {
            rank: 7,
            playerId: 'player7',
            playerName: 'IndexNinja',
            level: 42,
            xp: 42100,
            badges: ['Index-Pro', 'Performance-Tuner'],
            region: 'Asia'
          },
          {
            rank: 8,
            playerId: 'player8',
            playerName: 'QueryOptimizer',
            level: 41,
            xp: 41000,
            badges: ['Query-Master', 'Execution-Plan-Expert'],
            region: 'Europe'
          },
          {
            rank: 9,
            playerId: 'player9',
            playerName: 'DBArchitect',
            level: 40,
            xp: 40500,
            badges: ['Schema-Designer', 'High-Availability-Expert'],
            region: 'North America'
          },
          {
            rank: 10,
            playerId: 'player10',
            playerName: 'SQLMaster',
            level: 39,
            xp: 39800,
            badges: ['Query-Master', 'Join-Expert'],
            region: 'Asia'
          },
          {
            rank: 11,
            playerId: 'player11',
            playerName: 'DataEngineer',
            level: 38,
            xp: 38500,
            badges: ['ETL-Expert', 'Performance-Tuner'],
            region: 'Europe'
          },
          {
            rank: 12,
            playerId: 'player12',
            playerName: 'BackupWizard',
            level: 37,
            xp: 37200,
            badges: ['Backup-Recovery-Expert', 'High-Availability-Expert'],
            region: 'North America'
          },
          {
            rank: 13,
            playerId: 'player13',
            playerName: 'TransactionGuru',
            level: 36,
            xp: 36800,
            badges: ['Transaction-Master', 'Concurrency-Expert'],
            region: 'Asia'
          },
          {
            rank: 14,
            playerId: 'player14',
            playerName: 'SecurityMaster',
            level: 35,
            xp: 35500,
            badges: ['Security-Expert', 'Audit-Master'],
            region: 'Europe'
          },
          {
            rank: 15,
            playerId: 'player15',
            playerName: 'PerformanceTuner',
            level: 34,
            xp: 34200,
            badges: ['Performance-Wizard', 'Query-Optimizer'],
            region: 'North America'
          },
          {
            rank: 16,
            playerId: 'player16',
            playerName: 'ReplicationExpert',
            level: 33,
            xp: 33800,
            badges: ['Replication-Master', 'High-Availability-Expert'],
            region: 'Asia'
          },
          {
            rank: 17,
            playerId: 'player17',
            playerName: 'SQLDeveloper',
            level: 32,
            xp: 32500,
            badges: ['Stored-Procedure-Expert', 'Trigger-Master'],
            region: 'Europe'
          },
          {
            rank: 18,
            playerId: 'player18',
            playerName: 'DataModeler',
            level: 31,
            xp: 31200,
            badges: ['Schema-Designer', 'Normalization-Expert'],
            region: 'North America'
          },
          {
            rank: 19,
            playerId: 'player19',
            playerName: 'CloudDBExpert',
            level: 30,
            xp: 30800,
            badges: ['Cloud-Migration-Expert', 'Scaling-Master'],
            region: 'Asia'
          },
          {
            rank: 20,
            playerId: 'player20',
            playerName: 'SQLAnalyst',
            level: 29,
            xp: 29500,
            badges: ['Analytics-Expert', 'Data-Warehouse-Master'],
            region: 'Europe'
          }
        ];
        
        // Add current player to the leaderboard
        if (player) {
          const currentPlayerRank = Math.floor(Math.random() * 100) + 21; // Random rank between 21-120
          const currentPlayerEntry: LeaderboardEntry = {
            rank: currentPlayerRank,
            playerId: player.id,
            playerName: player.username,
            level: player.level,
            xp: player.xp,
            badges: player.badges?.map(badge => badge.name) || [],
            isCurrentPlayer: true,
            region: 'Europe' // Assuming player's region
          };
          
          // Only add current player for global leaderboard
          if (leaderboardType === 'global') {
            mockLeaderboard.push(currentPlayerEntry);
          }
        }
        
        // Filter by region if needed
        let filteredData = [...mockLeaderboard];
        if (region !== 'all' && leaderboardType === 'global') {
          filteredData = filteredData.filter(entry => entry.region === region);
        }
        
        // Filter by search query if provided
        if (searchQuery) {
          filteredData = filteredData.filter(entry => 
            entry.playerName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        // Sort by rank
        filteredData.sort((a, b) => a.rank - b.rank);
        
        // Generate friends leaderboard if selected
        if (leaderboardType === 'friends') {
          // In a real app, this would fetch actual friend data
          filteredData = [
            {
              rank: 1,
              playerId: 'friend1',
              playerName: 'BestSQLBuddy',
              level: 42,
              xp: 42000,
              badges: ['Query-Master', 'Join-Expert'],
              region: 'Europe'
            },
            {
              rank: 2,
              playerId: 'friend2',
              playerName: 'CodeFriend',
              level: 38,
              xp: 38500,
              badges: ['Index-Pro'],
              region: 'North America'
            },
            {
              rank: 3,
              playerId: 'friend3',
              playerName: 'DevBuddy',
              level: 35,
              xp: 35200,
              badges: ['Performance-Tuner'],
              region: 'Asia'
            },
            {
              rank: 4,
              playerId: player?.id || 'currentPlayer',
              playerName: player?.username || 'You',
              level: player?.level || 30,
              xp: player?.xp || 30000,
              badges: player?.badges?.map(badge => badge.name) || [],
              isCurrentPlayer: true,
              region: 'Europe'
            },
            {
              rank: 5,
              playerId: 'friend4',
              playerName: 'SQLPal',
              level: 28,
              xp: 28500,
              badges: ['Security-Expert'],
              region: 'South America'
            }
          ];
        }
        
        // Generate regional leaderboard if selected
        if (leaderboardType === 'regional') {
          // Filter to only show players from Europe (assuming player's region)
          filteredData = mockLeaderboard.filter(entry => entry.region === 'Europe');
        }
        
        setLeaderboardData(filteredData);
        setTotalPages(Math.ceil(filteredData.length / 10)); // 10 items per page
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };
    
    loadLeaderboardData();
  }, [leaderboardType, player, region, searchQuery]);
  
  /**
   * Handles changing the leaderboard type
   * @param {string} type - The leaderboard type to display
   */
  const handleLeaderboardTypeChange = (type: 'global' | 'friends' | 'regional') => {
    setLeaderboardType(type);
    setCurrentPage(1); // Reset to first page
  };
  
  /**
   * Handles changing the region filter
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  /**
   * Handles changing the search query
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page
  };
  
  /**
   * Handles pagination
   * @param {number} page - The page number to navigate to
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  /**
   * Gets the current page of leaderboard data
   * @returns {LeaderboardEntry[]} The current page of leaderboard data
   */
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    return leaderboardData.slice(startIndex, endIndex);
  };
  
  /**
   * Renders a badge with appropriate styling
   * @param {string} badge - The badge name
   * @returns {JSX.Element} The rendered badge
   */
  const renderBadge = (badge: string) => {
    // Define badge colors based on type
    const badgeColors: Record<string, string> = {
      'Index-Pro': 'bg-blue-600 bg-opacity-20 text-blue-400',
      'Query-Master': 'bg-purple-600 bg-opacity-20 text-purple-400',
      'Join-Expert': 'bg-green-600 bg-opacity-20 text-green-400',
      'Security-Expert': 'bg-red-600 bg-opacity-20 text-red-400',
      'Performance-Wizard': 'bg-yellow-600 bg-opacity-20 text-yellow-400',
      'Tuner': 'bg-indigo-600 bg-opacity-20 text-indigo-400',
      'Sec-Guru': 'bg-red-600 bg-opacity-20 text-red-400',
      'Schema-Designer': 'bg-teal-600 bg-opacity-20 text-teal-400',
      'Transaction-Master': 'bg-orange-600 bg-opacity-20 text-orange-400',
      'Normalization-Expert': 'bg-pink-600 bg-opacity-20 text-pink-400',
      'Query-Optimizer': 'bg-purple-600 bg-opacity-20 text-purple-400',
      'Performance-Tuner': 'bg-yellow-600 bg-opacity-20 text-yellow-400',
      'Execution-Plan-Expert': 'bg-blue-600 bg-opacity-20 text-blue-400',
      'High-Availability-Expert': 'bg-green-600 bg-opacity-20 text-green-400',
      'ETL-Expert': 'bg-indigo-600 bg-opacity-20 text-indigo-400',
      'Backup-Recovery-Expert': 'bg-teal-600 bg-opacity-20 text-teal-400',
      'Concurrency-Expert': 'bg-orange-600 bg-opacity-20 text-orange-400',
      'Audit-Master': 'bg-red-600 bg-opacity-20 text-red-400',
      'Replication-Master': 'bg-blue-600 bg-opacity-20 text-blue-400',
      'Stored-Procedure-Expert': 'bg-purple-600 bg-opacity-20 text-purple-400',
      'Trigger-Master': 'bg-green-600 bg-opacity-20 text-green-400',
      'Cloud-Migration-Expert': 'bg-indigo-600 bg-opacity-20 text-indigo-400',
      'Scaling-Master': 'bg-teal-600 bg-opacity-20 text-teal-400',
      'Analytics-Expert': 'bg-yellow-600 bg-opacity-20 text-yellow-400',
      'Data-Warehouse-Master': 'bg-orange-600 bg-opacity-20 text-orange-400'
    };
    
    // Default color if badge not found in mapping
    const badgeColor = badgeColors[badge] || 'bg-gray-600 bg-opacity-20 text-gray-400';
    
    return (
      <span 
        key={badge}
        className={`text-xs px-2 py-1 rounded ${badgeColor} mr-1 mb-1 inline-block`}
      >
        {badge}
      </span>
    );
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-gray-300">
          See how you rank against other SQL masters from around the world.
        </p>
      </div>
      
      {/* Leaderboard filters and controls */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Leaderboard type selector */}
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 rounded-md ${leaderboardType === 'global' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleLeaderboardTypeChange('global')}
            >
              Global
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${leaderboardType === 'friends' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleLeaderboardTypeChange('friends')}
            >
              Friends
            </button>
            <button 
              className={`px-4 py-2 rounded-md ${leaderboardType === 'regional' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
              onClick={() => handleLeaderboardTypeChange('regional')}
            >
              Regional
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Region filter (only for global leaderboard) */}
            {leaderboardType === 'global' && (
              <select
                className="bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={region}
                onChange={handleRegionChange}
              >
                <option value="all">All Regions</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="South America">South America</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            )}
            
            {/* Search filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-gray-700 text-white rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leaderboard table */}
      <div className="card mb-6 overflow-x-auto">
        {isLoadingLeaderboard ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : leaderboardData.length > 0 ? (
          <table className="w-full min-w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="px-4 py-3 w-16">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 w-20">Level</th>
                <th className="px-4 py-3 w-24">XP</th>
                <th className="px-4 py-3">Badges</th>
                {leaderboardType === 'global' && region === 'all' && (
                  <th className="px-4 py-3 w-32">Region</th>
                )}
              </tr>
            </thead>
            <tbody>
              {getCurrentPageData().map((entry) => (
                <tr 
                  key={entry.playerId}
                  className={`border-b border-gray-700 ${entry.isCurrentPlayer ? 'bg-primary bg-opacity-10' : 'hover:bg-gray-800'}`}
                >
                  <td className="px-4 py-4">
                    {entry.rank <= 3 ? (
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${entry.rank === 1 ? 'bg-yellow-500 text-black' : 
                          entry.rank === 2 ? 'bg-gray-400 text-black' : 
                          'bg-amber-700 text-white'}
                      `}>
                        {entry.rank}
                      </div>
                    ) : (
                      <span className="text-gray-400">{entry.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold mr-3">
                        {entry.avatarUrl ? (
                          <img 
                            src={entry.avatarUrl} 
                            alt={entry.playerName} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          entry.playerName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {entry.playerName}
                          {entry.isCurrentPlayer && (
                            <span className="ml-2 text-xs bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-gray-700 px-2 py-1 rounded text-sm">
                      {entry.level}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {entry.xp.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap">
                      {entry.badges.slice(0, 3).map(badge => renderBadge(badge))}
                      {entry.badges.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                          +{entry.badges.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  {leaderboardType === 'global' && region === 'all' && (
                    <td className="px-4 py-4 text-gray-300">
                      {entry.region}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No players found</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {leaderboardData.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`px-3 py-1 rounded ${currentPage === page ? 'bg-primary text-white' : 'bg-gray-700 text-white'}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button
              className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Player's current rank card (if not visible in current page) */}
      {player && leaderboardType === 'global' && !getCurrentPageData().some(entry => entry.isCurrentPlayer) && (
        <div className="card mt-6 bg-primary bg-opacity-10 border border-primary border-opacity-30">
          <h3 className="text-lg font-semibold mb-3">Your Ranking</h3>
          
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold mr-3">
              {player.avatarUrl ? (
                <img 
                  src={player.avatarUrl} 
                  alt={player.username} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                player.username.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <div className="font-medium">{player.username}</div>
              <div className="text-sm text-gray-300">
                Rank: <span className="text-primary">{Math.floor(Math.random() * 100) + 21}</span> • 
                Level: {player.level} • 
                XP: {player.xp.toLocaleString()}
              </div>
            </div>
            
            <button className="btn-secondary text-sm">
              View Details
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default LeaderboardPage;
