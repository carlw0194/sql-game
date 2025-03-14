import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import MonacoEditor from '@monaco-editor/react';

/**
 * SandboxPage Component
 * 
 * This component implements the Sandbox Mode of the SQL Scenario game.
 * It provides an open environment for players to practice SQL queries with
 * different datasets and receive immediate feedback on query performance.
 * 
 * The sandbox allows players to:
 * 1. Select from different sample databases
 * 2. Write and execute SQL queries
 * 3. View execution plans and performance metrics
 * 4. Save queries for future reference
 * 
 * @returns {JSX.Element} The rendered sandbox page
 */
const SandboxPage = () => {
  // State for selected dataset, query, and results
  const [selectedDataset, setSelectedDataset] = useState('ecommerce');
  const [query, setQuery] = useState('SELECT * FROM customers\nWHERE last_purchase_date > \'2023-01-01\'\nORDER BY total_spent DESC\nLIMIT 10;');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<null | {
    executionTime: number;
    rowCount: number;
    executionPlan: string;
    data: Array<Record<string, any>>;
    error?: string;
  }>(null);
  
  // Available sample datasets
  const datasets = [
    { id: 'ecommerce', name: 'E-Commerce Database' },
    { id: 'hospital', name: 'Hospital Management System' },
    { id: 'banking', name: 'Banking Transactions' },
    { id: 'inventory', name: 'Inventory Management' },
    { id: 'custom', name: 'Upload Custom Dataset' }
  ];
  
  /**
   * Executes the SQL query and processes the results
   * In a real implementation, this would connect to a backend service
   * that would execute the query against the selected database
   */
  const executeQuery = () => {
    setIsExecuting(true);
    
    // Simulate query execution with a timeout
    setTimeout(() => {
      setIsExecuting(false);
      
      // Mock results based on selected dataset
      if (selectedDataset === 'ecommerce') {
        setResults({
          executionTime: 0.45,
          rowCount: 10,
          executionPlan: 'Seq Scan on customers (cost=0.00..35.50 rows=10 width=72)',
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', last_purchase_date: '2023-05-15', total_spent: 1250.99 },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', last_purchase_date: '2023-04-22', total_spent: 890.50 },
            { id: 3, name: 'Robert Johnson', email: 'robert@example.com', last_purchase_date: '2023-03-18', total_spent: 2145.75 },
            // More rows would be here in a real implementation
          ]
        });
      } else {
        // For other datasets, show a placeholder result
        setResults({
          executionTime: 0.32,
          rowCount: 5,
          executionPlan: 'Seq Scan on [table] (cost=0.00..25.10 rows=5 width=64)',
          data: [
            { id: 1, name: 'Sample Data 1', value: 100 },
            { id: 2, name: 'Sample Data 2', value: 200 },
            { id: 3, name: 'Sample Data 3', value: 300 },
            { id: 4, name: 'Sample Data 4', value: 400 },
            { id: 5, name: 'Sample Data 5', value: 500 },
          ]
        });
      }
    }, 1000);
  };
  
  /**
   * Clears the current query in the editor
   */
  const clearQuery = () => {
    setQuery('');
    setResults(null);
  };
  
  /**
   * Saves the current query for future reference
   * In a real implementation, this would store the query in a database
   */
  const saveQuery = () => {
    // Mock implementation - would connect to backend in real app
    alert('Query saved successfully!');
  };
  
  /**
   * Handles dataset selection change
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event
   */
  const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(e.target.value);
    setResults(null); // Clear results when changing dataset
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Sandbox Mode</h1>
        <p className="text-gray-300">
          Practice SQL in an open environment with instant feedback and performance metrics.
        </p>
      </div>
      
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="dataset" className="block mb-2 text-sm font-medium">
              Select Dataset:
            </label>
            <select
              id="dataset"
              className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedDataset}
              onChange={handleDatasetChange}
            >
              {datasets.map(dataset => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedDataset === 'custom' && (
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium">
                Upload SQL File:
              </label>
              <input
                type="file"
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                accept=".sql,.txt"
              />
            </div>
          )}
          
          <div className="flex-1 md:text-right">
            <button className="btn-secondary" onClick={() => {}}>
              View Schema
            </button>
          </div>
        </div>
      </div>
      
      {/* SQL Editor */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">SQL Editor</h2>
        <div className="sql-editor h-64 mb-4">
          <MonacoEditor
            height="100%"
            language="sql"
            theme="vs-dark"
            value={query}
            onChange={(value) => setQuery(value || '')}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: 'on'
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            className="btn-primary"
            onClick={executeQuery}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </button>
          <button 
            className="btn-secondary"
            onClick={clearQuery}
          >
            Clear
          </button>
          <button 
            className="ml-auto btn-secondary"
            onClick={saveQuery}
          >
            Save Query
          </button>
        </div>
      </div>
      
      {/* Query Results */}
      {(isExecuting || results) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Query Results</h2>
          
          {isExecuting ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : results ? (
            <div>
              {/* Performance metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-400 mb-1">Execution Time</div>
                  <div className="text-lg">{results.executionTime} ms</div>
                </div>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-400 mb-1">Row Count</div>
                  <div className="text-lg">{results.rowCount}</div>
                </div>
                <div className="bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-400 mb-1">Query Cost</div>
                  <div className="text-lg">{results.executionTime < 0.5 ? 'Low' : 'Medium'}</div>
                </div>
              </div>
              
              {/* Execution plan */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Execution Plan</h3>
                <div className="bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                  {results.executionPlan}
                </div>
              </div>
              
              {/* Results table */}
              {results.data.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Data</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          {Object.keys(results.data[0]).map(key => (
                            <th 
                              key={key}
                              className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {results.data.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-800">
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="px-4 py-2 whitespace-nowrap">
                                {value as string}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Error message if any */}
              {results.error && (
                <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-400">
                  <h3 className="font-medium mb-1">Error</h3>
                  <p>{results.error}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </MainLayout>
  );
};

export default SandboxPage;
