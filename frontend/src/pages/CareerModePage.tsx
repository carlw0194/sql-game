import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';

/**
 * CareerModePage Component
 * 
 * This component implements the Career Mode of the SQL Scenario game.
 * It allows players to select level clusters and individual levels,
 * displaying their progress through the game's learning path.
 * 
 * @returns {JSX.Element} The rendered career mode page
 */
const CareerModePage = () => {
  // State for tracking selected level cluster and level
  const [selectedCluster, setSelectedCluster] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  
  // Mock data for level clusters
  const levelClusters = [
    { id: 1, name: 'Foundation Queries', range: '1-10', unlocked: true },
    { id: 2, name: 'Joins & Subqueries', range: '11-20', unlocked: true },
    { id: 3, name: 'Indexing Basics', range: '21-30', unlocked: true },
    { id: 4, name: 'Intermediate Queries', range: '31-40', unlocked: false },
    { id: 5, name: 'Performance Tuning', range: '41-50', unlocked: false },
  ];
  
  // Generate levels for the selected cluster
  const generateLevels = (clusterId: number) => {
    const cluster = levelClusters.find(c => c.id === clusterId);
    if (!cluster) return [];
    
    const [start, end] = cluster.range.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => ({
      id: start + i,
      name: `Level ${start + i}`,
      completed: start + i < 4, // Mock data: first 3 levels completed
      unlocked: start + i < 6,  // Mock data: first 5 levels unlocked
    }));
  };
  
  const levels = generateLevels(selectedCluster);
  
  // Calculate overall progress percentage
  const progressPercentage = 30; // Mock data: 30% progress
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Career Mode</h1>
        <p className="text-gray-300">
          Progress through levels of increasing difficulty, mastering SQL concepts along the way.
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-1">
          <span className="text-sm">Overall Progress</span>
          <span className="text-sm">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Level clusters selection */}
        <div className="lg:w-1/3">
          <h2 className="text-xl font-semibold mb-4">Level Clusters</h2>
          <div className="card">
            <div className="space-y-2">
              {levelClusters.map(cluster => (
                <div 
                  key={cluster.id}
                  className={`
                    level-item
                    ${selectedCluster === cluster.id ? 'active' : ''}
                    ${!cluster.unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => cluster.unlocked && setSelectedCluster(cluster.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{cluster.name}</div>
                    <div className="text-sm text-gray-400">Levels {cluster.range}</div>
                  </div>
                  {!cluster.unlocked && (
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">Locked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Individual levels grid */}
        <div className="lg:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Select Level</h2>
          <div className="card">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {levels.map(level => (
                <div
                  key={level.id}
                  className={`
                    p-3 rounded-md text-center transition-all
                    ${selectedLevel === level.id ? 'bg-primary bg-opacity-20 border border-primary' : 'bg-surface'}
                    ${level.completed ? 'ring-2 ring-green-500' : ''}
                    ${!level.unlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}
                  `}
                  onClick={() => level.unlocked && setSelectedLevel(level.id)}
                >
                  <div className="font-medium">{level.name}</div>
                  {level.completed && (
                    <div className="text-xs text-green-500 mt-1">Completed</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Level details and start button */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium mb-2">
                Level {selectedLevel}: Basic SELECT Query
              </h3>
              <p className="text-gray-300 mb-4">
                Learn to retrieve data from a database table using the SELECT statement.
                This foundational skill is essential for all SQL operations.
              </p>
              <button className="btn-primary">
                {levels.find(l => l.id === selectedLevel)?.completed 
                  ? 'Replay Level' 
                  : 'Start Level'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CareerModePage;
