import { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

/**
 * ChallengeScreen Component
 * 
 * This component implements the main challenge interface where players write SQL queries
 * to solve scenario-based problems. It includes a SQL editor, database schema viewer,
 * and results display with performance metrics.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.title - The title of the challenge
 * @param {string} props.description - The scenario description
 * @param {Object} props.schema - The database schema information
 * @returns {JSX.Element} The rendered challenge screen
 */
interface ChallengeScreenProps {
  title: string;
  description: string;
  schema: {
    tables: Array<{
      name: string;
      columns: Array<{
        name: string;
        type: string;
        isPrimary?: boolean;
        isForeign?: boolean;
        references?: string;
      }>;
    }>;
  };
}

const ChallengeScreen = ({ title, description, schema }: ChallengeScreenProps) => {
  // State for SQL query and execution results
  const [query, setQuery] = useState('SELECT * FROM Orders\nJOIN Customers ON Orders.customer_id = Customers.id\nWHERE Orders.order_date > \'2023-01-01\';');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<null | {
    executionTime: number;
    rowCount: number;
    needsIndexing: boolean;
    data: Array<Record<string, any>>;
    message?: string;
  }>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState('05:48');
  
  // Function to handle query execution
  const executeQuery = () => {
    setIsExecuting(true);
    
    // Simulate query execution with a timeout
    setTimeout(() => {
      setIsExecuting(false);
      
      // Mock results
      setResults({
        executionTime: 3.2,
        rowCount: 150,
        needsIndexing: true,
        data: [
          { id: 1, customer_name: 'John Doe', order_date: '2023-02-15', total: 125.99 },
          { id: 2, customer_name: 'Jane Smith', order_date: '2023-03-22', total: 89.50 },
          { id: 3, customer_name: 'Robert Johnson', order_date: '2023-02-28', total: 245.75 },
          // More rows would be here in a real implementation
        ]
      });
    }, 1500);
  };
  
  // Function to handle query submission for evaluation
  const submitQuery = () => {
    executeQuery();
    // In a real implementation, this would also evaluate the query against the expected solution
  };
  
  // Function to show a hint
  const showHint = () => {
    if (hintsUsed < 3) {
      setHintsUsed(hintsUsed + 1);
      // In a real implementation, this would fetch and display an appropriate hint
    }
  };
  
  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
      {/* Challenge header */}
      <div className="bg-gray-800 p-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-300 mt-1">{description}</p>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Left panel: Schema and hints */}
        <div className="lg:w-1/3 p-4 border-r border-gray-700">
          <h3 className="text-lg font-medium mb-3">Database Schema</h3>
          
          <div className="space-y-4">
            {schema.tables.map(table => (
              <div key={table.name} className="bg-gray-800 p-3 rounded">
                <h4 className="font-medium mb-2">{table.name}</h4>
                <div className="text-sm">
                  {table.columns.map(column => (
                    <div key={column.name} className="flex justify-between py-1 border-b border-gray-700 last:border-0">
                      <span className="flex items-center">
                        {column.isPrimary && (
                          <span className="mr-1 text-yellow-500 text-xs">🔑</span>
                        )}
                        {column.isForeign && (
                          <span className="mr-1 text-blue-400 text-xs">🔗</span>
                        )}
                        {column.name}
                      </span>
                      <span className="text-gray-400">{column.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span>Hints used: {hintsUsed}/3</span>
              <span>Time left: {timeLeft}</span>
            </div>
            <button 
              className="btn-secondary w-full"
              onClick={showHint}
              disabled={hintsUsed >= 3}
            >
              Use Hint
            </button>
            
            {hintsUsed > 0 && (
              <div className="mt-3 bg-gray-800 p-3 rounded text-sm">
                <p className="font-medium text-yellow-400">Hint #{hintsUsed}:</p>
                <p className="mt-1">
                  Consider adding an index on the order_date column to improve query performance.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel: SQL editor and results */}
        <div className="lg:w-2/3 flex flex-col">
          {/* SQL Editor */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-medium mb-3">SQL Editor</h3>
            <div className="sql-editor h-64">
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
            
            <div className="flex space-x-3 mt-3">
              <button 
                className="btn-primary"
                onClick={executeQuery}
                disabled={isExecuting}
              >
                {isExecuting ? 'Running...' : 'Run Query'}
              </button>
              <button 
                className="btn-secondary"
                onClick={submitQuery}
                disabled={isExecuting}
              >
                Submit
              </button>
            </div>
          </div>
          
          {/* Results section */}
          <div className="p-4 flex-grow overflow-auto">
            <h3 className="text-lg font-medium mb-3">Output / Results</h3>
            
            {isExecuting ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : results ? (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <span className="text-gray-400">Execution time:</span>
                    <span className={`ml-2 ${results.executionTime > 2 ? 'text-red-400' : 'text-green-400'}`}>
                      {results.executionTime}s
                    </span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <span className="text-gray-400">Row count:</span>
                    <span className="ml-2">{results.rowCount}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <span className="text-gray-400">Index needed?</span>
                    <span className={`ml-2 ${results.needsIndexing ? 'text-red-400' : 'text-green-400'}`}>
                      {results.needsIndexing ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <span className="text-gray-400">Score:</span>
                    <span className="ml-2">80/100</span>
                  </div>
                </div>
                
                {/* Results table */}
                {results.data.length > 0 && (
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
                          <tr key={i}>
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
                )}
                
                {results.message && (
                  <div className="mt-4 p-3 bg-gray-800 rounded">
                    <p>{results.message}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 italic">
                Run your query to see results here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeScreen;
