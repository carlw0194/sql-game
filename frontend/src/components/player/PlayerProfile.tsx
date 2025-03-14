import React from 'react';
import { Player } from '../../types';

/**
 * PlayerProfile Component
 * 
 * This component displays a player's profile information, including their
 * username, level, title, XP progress, and skills. It can be used in various
 * parts of the application where player information needs to be shown.
 * 
 * @param {Object} props - Component properties
 * @param {Player} props.player - The player object containing profile information
 * @param {boolean} props.showSkills - Whether to display the player's skills (default: true)
 * @param {boolean} props.showBadges - Whether to display the player's badges (default: false)
 * @param {string} props.className - Additional CSS classes to apply to the component
 * @returns {JSX.Element} The rendered player profile
 */
interface PlayerProfileProps {
  player: Player;
  showSkills?: boolean;
  showBadges?: boolean;
  className?: string;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  player,
  showSkills = true,
  showBadges = false,
  className = ''
}) => {
  // Calculate XP progress percentage
  const xpProgressPercent = Math.round((player.xp / (player.xp + player.xpToNextLevel)) * 100);
  
  return (
    <div className={`bg-surface rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header with avatar and basic info */}
      <div className="p-4 bg-gray-800">
        <div className="flex items-center">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold mr-4">
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
          
          {/* Basic info */}
          <div>
            <h2 className="text-xl font-semibold">{player.username}</h2>
            <div className="flex items-center text-sm">
              <span className="bg-primary bg-opacity-20 text-primary px-2 py-0.5 rounded mr-2">
                Level {player.level}
              </span>
              <span className="text-gray-300">{player.title}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Joined {new Date(player.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* XP Progress */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between text-sm mb-1">
          <span>XP Progress</span>
          <span>{player.xp} / {player.xp + player.xpToNextLevel} XP</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary"
            style={{ width: `${xpProgressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {player.xpToNextLevel} XP needed for Level {player.level + 1}
        </p>
      </div>
      
      {/* Skills */}
      {showSkills && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium mb-3">Skills</h3>
          
          {/* Query Mastery */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Query Mastery</span>
              <span>{player.skills.queryMastery}/100</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${player.skills.queryMastery}%` }}
              ></div>
            </div>
          </div>
          
          {/* Indexing */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Indexing</span>
              <span>{player.skills.indexing}/100</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${player.skills.indexing}%` }}
              ></div>
            </div>
          </div>
          
          {/* Optimization */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Optimization</span>
              <span>{player.skills.optimization}/100</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500"
                style={{ width: `${player.skills.optimization}%` }}
              ></div>
            </div>
          </div>
          
          {/* Security */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Security</span>
              <span>{player.skills.security}/100</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: `${player.skills.security}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Badges */}
      {showBadges && player.badges.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3">Badges Earned</h3>
          <div className="grid grid-cols-2 gap-3">
            {player.badges.map(badge => (
              <div 
                key={badge.id}
                className="flex items-center bg-gray-800 p-2 rounded"
              >
                <div className="w-10 h-10 mr-3 flex-shrink-0">
                  <img 
                    src={badge.iconUrl} 
                    alt={badge.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{badge.name}</p>
                  <p className="text-xs text-gray-400">
                    {badge.earnedDate && new Date(badge.earnedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerProfile;
