import { useState, useEffect } from 'react';
import { Player, LevelCluster, Level } from '../types';
import { getPlayerProfile, getLevelClusters, getLevelById } from '../services/gameService';

/**
 * Custom hook for managing game state
 * 
 * This hook centralizes access to player data, level information, and game progress.
 * It handles loading states and provides methods for interacting with the game state.
 * 
 * @returns {Object} Game state and methods for interacting with it
 */
const useGameState = () => {
  // Player state
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  
  // Level clusters state (for career mode)
  const [levelClusters, setLevelClusters] = useState<LevelCluster[]>([]);
  const [isLoadingClusters, setIsLoadingClusters] = useState(false);
  
  // Current level state
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);
  
  /**
   * Loads the player profile data
   */
  const loadPlayerProfile = async () => {
    setIsLoadingPlayer(true);
    try {
      const profileData = await getPlayerProfile();
      setPlayer(profileData);
    } catch (error) {
      console.error('Error loading player profile:', error);
    } finally {
      setIsLoadingPlayer(false);
    }
  };
  
  /**
   * Loads all level clusters for career mode
   */
  const loadLevelClusters = async () => {
    setIsLoadingClusters(true);
    try {
      const clusters = await getLevelClusters();
      setLevelClusters(clusters);
    } catch (error) {
      console.error('Error loading level clusters:', error);
    } finally {
      setIsLoadingClusters(false);
    }
  };
  
  /**
   * Loads a specific level by ID
   * 
   * @param {number} levelId - The ID of the level to load
   */
  const loadLevel = async (levelId: number) => {
    setIsLoadingLevel(true);
    try {
      const level = await getLevelById(levelId);
      setCurrentLevel(level);
    } catch (error) {
      console.error(`Error loading level ${levelId}:`, error);
    } finally {
      setIsLoadingLevel(false);
    }
  };
  
  /**
   * Updates player XP and potentially level after completing a challenge
   * 
   * @param {number} xpEarned - Amount of XP earned
   */
  const updatePlayerProgress = (xpEarned: number) => {
    if (!player) return;
    
    // Calculate new XP total
    const newXp = player.xp + xpEarned;
    const xpNeeded = player.xpToNextLevel;
    
    // Check if player leveled up
    if (newXp >= xpNeeded) {
      // Level up logic
      const newLevel = player.level + 1;
      const remainingXp = newXp - xpNeeded;
      const newXpToNextLevel = Math.round(xpNeeded * 1.5); // Increase XP needed for next level
      
      setPlayer({
        ...player,
        level: newLevel,
        xp: remainingXp,
        xpToNextLevel: newXpToNextLevel,
        // Update title if needed based on new level
        // This would typically come from the backend
      });
    } else {
      // Just update XP
      setPlayer({
        ...player,
        xp: newXp
      });
    }
  };
  
  /**
   * Updates the completion status of a level
   * 
   * @param {number} levelId - The ID of the completed level
   * @param {number} score - The score achieved (0-100)
   */
  const markLevelCompleted = (levelId: number, score: number) => {
    // Update level clusters with the completed level
    const updatedClusters = levelClusters.map(cluster => {
      // Find if this cluster contains the level
      const updatedLevels = cluster.levels.map(level => {
        if (level.id === levelId) {
          return {
            ...level,
            completed: true,
            score: Math.max(score, level.score || 0) // Keep highest score
          };
        }
        return level;
      });
      
      // Calculate new progress for the cluster
      const completedLevels = updatedLevels.filter(level => level.completed).length;
      const progress = completedLevels > 0 
        ? Math.round((completedLevels / updatedLevels.length) * 100) 
        : 0;
      
      return {
        ...cluster,
        levels: updatedLevels,
        progress
      };
    });
    
    setLevelClusters(updatedClusters);
    
    // Also update current level if it's the one that was completed
    if (currentLevel && currentLevel.id === levelId) {
      setCurrentLevel({
        ...currentLevel,
        completed: true,
        score: Math.max(score, currentLevel.score || 0)
      });
    }
  };
  
  // Load player profile and level clusters on initial mount
  useEffect(() => {
    loadPlayerProfile();
    loadLevelClusters();
  }, []);
  
  return {
    // State
    player,
    levelClusters,
    currentLevel,
    
    // Loading states
    isLoadingPlayer,
    isLoadingClusters,
    isLoadingLevel,
    
    // Methods
    loadPlayerProfile,
    loadLevelClusters,
    loadLevel,
    updatePlayerProgress,
    markLevelCompleted
  };
};

export default useGameState;
