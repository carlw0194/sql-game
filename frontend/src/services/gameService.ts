/**
 * Game Service for SQL Scenario
 * 
 * This file provides mock API services for the SQL Scenario game.
 * In a production environment, these functions would make actual API calls.
 */

import { Player, LevelCluster, Level, Challenge, QueryResult, Dataset } from '../types';

/**
 * Mock player data
 */
const mockPlayer: Player = {
  id: 'player1',
  username: 'SQLMaster',
  level: 5,
  title: 'Junior DBA',
  xp: 450,
  xpToNextLevel: 550,
  avatarUrl: '/avatars/default.png',
  joinedDate: '2023-01-15',
  skills: {
    queryMastery: 65,
    indexing: 40,
    optimization: 55,
    security: 30
  },
  badges: [
    {
      id: 'badge1',
      name: 'First Query',
      description: 'Executed your first SQL query',
      iconUrl: '/badges/first-query.png',
      earnedDate: '2023-01-16'
    },
    {
      id: 'badge2',
      name: 'Index Master',
      description: 'Created an index that improved query performance by 50%',
      iconUrl: '/badges/index-master.png',
      earnedDate: '2023-02-10'
    }
  ]
};

/**
 * Mock level clusters data
 */
const mockLevelClusters: LevelCluster[] = [
  {
    id: 1,
    name: 'SQL Basics',
    range: '1-5',
    description: 'Learn the fundamentals of SQL queries',
    unlocked: true,
    progress: 80,
    levels: [
      {
        id: 1,
        name: 'SELECT Statements',
        description: 'Learn how to retrieve data using SELECT',
        difficulty: 'beginner',
        completed: true,
        unlocked: true,
        score: 95,
        bestTime: 120,
        challenge: {
          id: 'challenge1',
          title: 'Your First Query',
          description: 'Retrieve customer information',
          scenario: 'As a data analyst, you need to retrieve all customers who made purchases in the last month.',
          initialQuery: 'SELECT * FROM customers',
          schema: {
            tables: [
              {
                name: 'customers',
                columns: [
                  { name: 'id', type: 'INT', isPrimary: true },
                  { name: 'name', type: 'VARCHAR(100)' },
                  { name: 'email', type: 'VARCHAR(100)' },
                  { name: 'last_purchase_date', type: 'DATE' }
                ],
                rowCount: 1000
              }
            ]
          },
          hints: [
            'Use the WHERE clause to filter by date',
            'Compare last_purchase_date with a specific date'
          ],
          expectedSolution: {
            criteria: {
              maxExecutionTime: 0.5
            },
            sampleSolution: "SELECT * FROM customers WHERE last_purchase_date >= '2023-02-01'"
          }
        }
      },
      // More levels would be defined here
    ]
  },
  {
    id: 2,
    name: 'Joins & Relationships',
    range: '6-10',
    description: 'Master table relationships and JOIN operations',
    unlocked: true,
    progress: 30,
    levels: []
  },
  {
    id: 3,
    name: 'Indexing & Performance',
    range: '11-15',
    description: 'Learn to optimize query performance with indexes',
    unlocked: false,
    progress: 0,
    levels: []
  }
];

/**
 * Mock datasets for sandbox mode
 */
const mockDatasets: Dataset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Database',
    description: 'A sample database for an online store with customers, products, orders, and inventory',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'id', type: 'INT', isPrimary: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'last_purchase_date', type: 'DATE' },
          { name: 'total_spent', type: 'DECIMAL(10,2)' }
        ],
        rowCount: 5000
      },
      {
        name: 'products',
        columns: [
          { name: 'id', type: 'INT', isPrimary: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'category', type: 'VARCHAR(50)' },
          { name: 'price', type: 'DECIMAL(10,2)' },
          { name: 'stock', type: 'INT' }
        ],
        rowCount: 1000
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INT', isPrimary: true },
          { name: 'customer_id', type: 'INT', isForeign: true, references: 'customers.id' },
          { name: 'order_date', type: 'DATE', hasIndex: true },
          { name: 'total', type: 'DECIMAL(10,2)' }
        ],
        rowCount: 10000
      }
    ],
    sampleQueries: [
      {
        title: 'Top Customers',
        query: 'SELECT name, email, total_spent FROM customers ORDER BY total_spent DESC LIMIT 10',
        description: 'Find the top 10 customers by total amount spent'
      },
      {
        title: 'Recent Orders',
        query: "SELECT o.id, c.name, o.order_date, o.total FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.order_date > '2023-01-01' ORDER BY o.order_date DESC",
        description: 'List recent orders with customer information'
      }
    ]
  }
];

/**
 * Fetches the current player's profile
 * @returns {Promise<Player>} Player profile data
 */
export const getPlayerProfile = async (): Promise<Player> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPlayer;
};

/**
 * Fetches level clusters for career mode
 * @returns {Promise<LevelCluster[]>} Array of level clusters
 */
export const getLevelClusters = async (): Promise<LevelCluster[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockLevelClusters;
};

/**
 * Fetches a specific level by ID
 * @param {number} levelId - The ID of the level to fetch
 * @returns {Promise<Level | null>} The level or null if not found
 */
export const getLevelById = async (levelId: number): Promise<Level | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Search for the level in all clusters
  for (const cluster of mockLevelClusters) {
    const level = cluster.levels.find(l => l.id === levelId);
    if (level) return level;
  }
  
  return null;
};

/**
 * Fetches available datasets for sandbox mode
 * @returns {Promise<Dataset[]>} Array of available datasets
 */
export const getDatasets = async (): Promise<Dataset[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockDatasets;
};

/**
 * Executes a SQL query and returns the results
 * @param {string} query - The SQL query to execute
 * @param {string} datasetId - The ID of the dataset to query
 * @returns {Promise<QueryResult>} The query execution results
 */
export const executeQuery = async (query: string, datasetId: string): Promise<QueryResult> => {
  // Simulate API call delay with variable time to simulate query execution
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  // Check for syntax errors (very basic check)
  if (!query.toLowerCase().includes('select')) {
    return {
      executionTime: 0,
      rowCount: 0,
      data: [],
      error: 'Syntax error: Query must include a SELECT statement'
    };
  }
  
  // Mock successful result
  return {
    executionTime: 0.45 + Math.random() * 0.5,
    rowCount: Math.floor(Math.random() * 100) + 1,
    needsIndexing: Math.random() > 0.7,
    executionPlan: 'Seq Scan on table (cost=0.00..35.50 rows=10 width=72)',
    data: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Sample Data ${i + 1}`,
      value: Math.floor(Math.random() * 1000)
    }))
  };
};

/**
 * Submits a solution for a challenge
 * @param {number} levelId - The ID of the level
 * @param {string} query - The SQL query solution
 * @returns {Promise<{score: number, feedback: string, xpEarned: number}>} The evaluation results
 */
export const submitSolution = async (
  levelId: number,
  query: string
): Promise<{score: number, feedback: string, xpEarned: number}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock evaluation result
  const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  const xpEarned = Math.floor(score / 2);
  
  return {
    score,
    feedback: score > 80 
      ? 'Great job! Your query is efficient and meets all requirements.' 
      : 'Good attempt! Consider using indexes to improve performance.',
    xpEarned
  };
};
