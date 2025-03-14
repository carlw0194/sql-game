/**
 * Game Utilities for SQL Scenario
 * 
 * This file contains utility functions and constants used throughout the SQL Scenario game.
 * These utilities help with common tasks like calculating player progress, formatting data,
 * and managing game state.
 */

import { Player, Level, LevelCluster, Challenge } from '../types';

/**
 * Calculates the player's overall progress percentage across all level clusters
 * 
 * @param {LevelCluster[]} clusters - Array of level clusters with their progress information
 * @returns {number} - Overall progress percentage (0-100)
 */
export const calculateOverallProgress = (clusters: LevelCluster[]): number => {
  // Skip if no clusters exist
  if (clusters.length === 0) return 0;
  
  // Calculate the sum of all cluster progress values
  const totalProgress = clusters.reduce((sum, cluster) => sum + cluster.progress, 0);
  
  // Return the average progress as a percentage
  return Math.round(totalProgress / clusters.length);
};

/**
 * Formats execution time to be more readable
 * 
 * @param {number} timeInSeconds - Execution time in seconds
 * @returns {string} - Formatted time string
 */
export const formatExecutionTime = (timeInSeconds: number): string => {
  // For very small times, show milliseconds
  if (timeInSeconds < 0.1) {
    return `${(timeInSeconds * 1000).toFixed(2)} ms`;
  }
  
  // For times under a minute, show seconds
  if (timeInSeconds < 60) {
    return `${timeInSeconds.toFixed(2)} s`;
  }
  
  // For longer times, format as minutes and seconds
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.round(timeInSeconds % 60);
  return `${minutes}m ${seconds}s`;
};

/**
 * Determines the performance rating based on execution time and other metrics
 * 
 * @param {number} executionTime - Query execution time in seconds
 * @param {boolean} usedIndex - Whether the query used an index
 * @param {number} rowsScanned - Number of rows scanned during query execution
 * @returns {string} - Performance rating ('Excellent', 'Good', 'Fair', or 'Poor')
 */
export const getPerformanceRating = (
  executionTime: number,
  usedIndex: boolean,
  rowsScanned: number
): string => {
  // Poor performance if no index was used when it should have been
  if (!usedIndex && rowsScanned > 1000) {
    return 'Poor';
  }
  
  // Base rating on execution time
  if (executionTime < 0.1) {
    return 'Excellent';
  } else if (executionTime < 0.5) {
    return 'Good';
  } else if (executionTime < 2) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

/**
 * Calculates the score for a completed challenge
 * 
 * @param {number} executionTime - Query execution time in seconds
 * @param {number} optimalTime - Optimal execution time in seconds
 * @param {boolean} usedIndex - Whether the query used an index
 * @param {boolean} indexRequired - Whether an index was required
 * @param {number} hintsUsed - Number of hints used
 * @returns {number} - Score from 0 to 100
 */
export const calculateChallengeScore = (
  executionTime: number,
  optimalTime: number,
  usedIndex: boolean,
  indexRequired: boolean,
  hintsUsed: number
): number => {
  // Base score starts at 100
  let score = 100;
  
  // Deduct points for slow execution (compared to optimal time)
  const timeRatio = executionTime / optimalTime;
  if (timeRatio > 1) {
    // Deduct up to 30 points based on how much slower than optimal
    score -= Math.min(30, Math.round((timeRatio - 1) * 20));
  }
  
  // Deduct 20 points if index was required but not used
  if (indexRequired && !usedIndex) {
    score -= 20;
  }
  
  // Deduct 10 points for each hint used
  score -= hintsUsed * 10;
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
};

/**
 * Formats a time string for countdown display
 * 
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} - Formatted time string (MM:SS)
 */
export const formatCountdownTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Determines the difficulty level color
 * 
 * @param {string} difficulty - Difficulty level ('beginner', 'intermediate', 'advanced', or 'expert')
 * @returns {string} - CSS color class
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-400';
    case 'intermediate':
      return 'text-blue-400';
    case 'advanced':
      return 'text-yellow-400';
    case 'expert':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

/**
 * Calculates XP earned based on challenge difficulty and score
 * 
 * @param {string} difficulty - Challenge difficulty level
 * @param {number} score - Challenge score (0-100)
 * @returns {number} - XP earned
 */
export const calculateXpEarned = (difficulty: string, score: number): number => {
  // Base XP values for each difficulty level
  const baseXp = {
    beginner: 50,
    intermediate: 100,
    advanced: 200,
    expert: 400
  };
  
  // Get base XP for the given difficulty (default to beginner if not found)
  const base = baseXp[difficulty as keyof typeof baseXp] || baseXp.beginner;
  
  // Calculate XP based on score percentage and round to nearest 5
  return Math.round((base * (score / 100)) / 5) * 5;
};

/**
 * Game difficulty levels
 */
export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

/**
 * Player titles based on level
 */
export const PLAYER_TITLES = {
  1: 'SQL Novice',
  5: 'Junior DBA',
  10: 'SQL Developer',
  15: 'Database Analyst',
  20: 'Senior DBA',
  25: 'Database Architect',
  30: 'SQL Master',
  40: 'Database Wizard',
  50: 'SQL Legend'
};

/**
 * Gets the appropriate player title based on level
 * 
 * @param {number} level - Player's current level
 * @returns {string} - Player title
 */
export const getPlayerTitle = (level: number): string => {
  // Find the highest title the player qualifies for
  const titles = Object.entries(PLAYER_TITLES)
    .filter(([reqLevel]) => parseInt(reqLevel) <= level)
    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
  
  // Return the highest title or default
  return titles.length > 0 ? titles[0][1] : 'SQL Novice';
};
