/**
 * Type Definitions for SQL Scenario Game
 * 
 * This file contains TypeScript interfaces and types used throughout the application.
 * Having centralized type definitions helps maintain consistency and enables better
 * code completion and type checking.
 */

/**
 * Represents a player's profile information
 */
export interface Player {
  id: string;
  username: string;
  level: number;
  title: string; // e.g., "Junior DBA", "Database Architect"
  xp: number;
  xpToNextLevel: number;
  avatarUrl?: string;
  joinedDate: string;
  skills: {
    queryMastery: number; // 0-100
    indexing: number; // 0-100
    optimization: number; // 0-100
    security: number; // 0-100
  };
  badges: Badge[];
}

/**
 * Represents an achievement badge that players can earn
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedDate?: string; // Only present if the player has earned this badge
}

/**
 * Represents a level cluster in the Career Mode
 */
export interface LevelCluster {
  id: number;
  name: string;
  range: string; // e.g., "1-10"
  description: string;
  unlocked: boolean;
  progress: number; // 0-100
  levels: Level[];
}

/**
 * Represents an individual level in the Career Mode
 */
export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completed: boolean;
  unlocked: boolean;
  score?: number; // 0-100, only present if completed
  bestTime?: number; // in seconds, only present if completed
  challenge: Challenge;
}

/**
 * Represents a SQL challenge to be solved
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  scenario: string;
  timeLimit?: number; // in seconds, optional for some challenges
  initialQuery: string;
  schema: DatabaseSchema;
  hints: string[];
  expectedSolution: {
    criteria: {
      maxExecutionTime?: number; // in seconds
      mustUseIndex?: boolean;
      mustUseJoin?: boolean;
      maxRowsScanned?: number;
      // Other criteria can be added as needed
    };
    sampleSolution: string; // Example of a correct solution
  };
}

/**
 * Represents a database schema for a challenge
 */
export interface DatabaseSchema {
  tables: Table[];
}

/**
 * Represents a database table in a schema
 */
export interface Table {
  name: string;
  columns: Column[];
  rowCount: number; // Approximate number of rows for context
}

/**
 * Represents a column in a database table
 */
export interface Column {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string; // e.g., "customers.id"
  hasIndex?: boolean;
}

/**
 * Represents the result of executing a SQL query
 */
export interface QueryResult {
  executionTime: number; // in seconds
  rowCount: number;
  needsIndexing?: boolean;
  executionPlan?: string;
  data: Array<Record<string, any>>;
  message?: string;
  error?: string;
}

/**
 * Represents a dataset available in Sandbox Mode
 */
export interface Dataset {
  id: string;
  name: string;
  description: string;
  tables: Table[];
  sampleQueries: {
    title: string;
    query: string;
    description: string;
  }[];
}

/**
 * Represents a leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  level: number;
  xp: number;
  badges: Badge[];
  bestScore?: number;
  region?: string;
}

/**
 * Represents a multiplayer match
 */
export interface MultiplayerMatch {
  id: string;
  type: 'duel' | 'team';
  status: 'waiting' | 'in-progress' | 'completed';
  startTime?: string;
  endTime?: string;
  players: {
    id: string;
    name: string;
    score?: number;
    completed?: boolean;
    timeToComplete?: number; // in seconds
  }[];
  challenge: Challenge;
}
