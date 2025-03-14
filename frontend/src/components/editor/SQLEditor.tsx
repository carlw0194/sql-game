import { useState, useEffect, useRef } from 'react';
import AIMentor from '../mentor/AIMentor';

/**
 * SQLEditor Component
 * 
 * This component provides a code editor for writing and executing SQL queries.
 * It includes features like syntax highlighting, error checking, auto-completion,
 * and an integrated AI mentor to help players learn SQL concepts.
 * 
 * Key features:
 * 1. Syntax highlighting for SQL
 * 2. Error and warning indicators
 * 3. Auto-completion suggestions
 * 4. Query execution with results display
 * 5. Execution plan visualization
 * 6. AI-powered hints and suggestions
 * 7. Customizable editor settings
 * 
 * The editor adapts to the player's skill level, providing more assistance
 * for beginners and more advanced features for experienced players.
 * 
 * @param {SQLEditorProps} props - Component properties
 * @returns {JSX.Element} The rendered SQL editor component
 */
interface SQLEditorProps {
  // Initial SQL query to populate the editor
  initialQuery?: string;
  
  // The current challenge context (tables, expected results, etc.)
  challengeContext?: {
    tables: {
      name: string;
      columns: {
        name: string;
        type: string;
        isPrimary?: boolean;
        isForeign?: boolean;
        references?: string;
      }[];
      sampleData?: any[];
    }[];
    scenario: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    expectedColumns?: string[];
    hints?: string[];
  };
  
  // The player's current level
  playerLevel?: number;
  
  // Callback function when a query is executed
  onQueryExecute?: (query: string) => void;
  
  // Callback function when a hint is requested
  onHintRequest?: () => void;
  
  // The current hint count and maximum available hints
  hintInfo?: {
    used: number;
    available: number;
  };
  
  // Whether to show the AI mentor
  showMentor?: boolean;
  
  // Editor settings
  editorSettings?: {
    fontSize: number;
    tabSize: number;
    lineNumbers: boolean;
    darkMode: boolean;
    autoComplete: boolean;
  };
}

const SQLEditor = ({
  initialQuery = '',
  challengeContext,
  playerLevel = 1,
  onQueryExecute = () => {},
  onHintRequest = () => {},
  hintInfo = { used: 0, available: 3 },
  showMentor = true,
  editorSettings = {
    fontSize: 14,
    tabSize: 2,
    lineNumbers: true,
    darkMode: true,
    autoComplete: true
  }
}: SQLEditorProps) => {
  // State for the current SQL query
  const [query, setQuery] = useState(initialQuery);
  
  // State for query execution results
  const [results, setResults] = useState<{
    columns: string[];
    rows: any[];
    error?: string;
    executionTime?: number;
  } | null>(null);
  
  // State for loading status when executing a query
  const [isExecuting, setIsExecuting] = useState(false);
  
  // State for editor errors and warnings
  const [editorIssues, setEditorIssues] = useState<{
    line: number;
    type: 'error' | 'warning';
    message: string;
  }[]>([]);
  
  // State for AI mentor visibility
  const [isMentorMinimized, setIsMentorMinimized] = useState(false);
  
  // Reference to the editor textarea
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  /**
   * Analyzes the current query for syntax errors and warnings
   * In a real implementation, this would use a SQL parser library
   */
  useEffect(() => {
    // Simple analysis based on common SQL patterns
    const analyzeQuery = () => {
      const issues: {
        line: number;
        type: 'error' | 'warning';
        message: string;
      }[] = [];
      
      const lines = query.split('\n');
      
      // Check for basic syntax errors
      if (query.includes('SELECT') && !query.includes('FROM')) {
        issues.push({
          line: lines.findIndex(line => line.toUpperCase().includes('SELECT')),
          type: 'error',
          message: 'SELECT statement must include a FROM clause'
        });
      }
      
      // Check for missing semicolon at the end
      if (query.trim().length > 0 && !query.trim().endsWith(';')) {
        issues.push({
          line: lines.length - 1,
          type: 'warning',
          message: 'SQL statement should end with a semicolon'
        });
      }
      
      // Enhanced SQL injection detection
      // Check for potential SQL injection vulnerabilities
      const sqlInjectionPatterns = [
        { pattern: /'\s*OR\s*'.*'\s*=\s*'/i, message: 'Possible SQL injection pattern detected (OR condition)' },
        { pattern: /'\s*;\s*DROP\s+TABLE/i, message: 'Possible SQL injection pattern detected (DROP TABLE)' },
        { pattern: /'\s*;\s*DELETE\s+FROM/i, message: 'Possible SQL injection pattern detected (DELETE FROM)' },
        { pattern: /'\s*UNION\s+SELECT/i, message: 'Possible SQL injection pattern detected (UNION SELECT)' },
        { pattern: /'\s*;\s*INSERT\s+INTO/i, message: 'Possible SQL injection pattern detected (INSERT INTO)' },
        { pattern: /'\s*;\s*UPDATE\s+.+\s+SET/i, message: 'Possible SQL injection pattern detected (UPDATE SET)' },
        { pattern: /'\s*--/i, message: 'Possible SQL injection pattern detected (comment)' },
        { pattern: /'\s*\/\*/i, message: 'Possible SQL injection pattern detected (comment)' }
      ];
      
      // Check each line for SQL injection patterns
      lines.forEach((line, index) => {
        for (const pattern of sqlInjectionPatterns) {
          if (pattern.pattern.test(line)) {
            issues.push({
              line: index,
              type: 'error',
              message: pattern.message
            });
            break; // Only report one issue per line
          }
        }
      });
      
      // Check for unescaped single quotes (potential SQL injection)
      if (query.includes("'") && !query.includes("''")) {
        const lineIndex = lines.findIndex(line => line.includes("'"));
        if (lineIndex !== -1) {
          issues.push({
            line: lineIndex,
            type: 'warning',
            message: 'Single quotes should be escaped as two single quotes (\'\') to prevent SQL injection'
          });
        }
      }
      
      setEditorIssues(issues);
    };
    
    if (query.trim().length > 0) {
      analyzeQuery();
    } else {
      setEditorIssues([]);
    }
  }, [query]);
  
  /**
   * Executes the current SQL query
   * In a real implementation, this would connect to a database or API
   */
  const executeQuery = () => {
    if (!query.trim()) return;
    
    setIsExecuting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      try {
        // Mock execution results based on the query
        // In a real implementation, this would use a database connection
        let mockResults = null;
        
        // Simple query parser to generate mock results
        if (query.toLowerCase().includes('select') && query.toLowerCase().includes('from')) {
          // Extract table name from the query
          const fromMatch = query.match(/from\s+(\w+)/i);
          const tableName = fromMatch ? fromMatch[1] : '';
          
          // Find the table in the challenge context
          const table = challengeContext?.tables.find(t => 
            t.name.toLowerCase() === tableName.toLowerCase()
          );
          
          if (table) {
            // Generate mock columns and rows
            mockResults = {
              columns: table.columns.map(col => col.name),
              rows: table.sampleData || generateMockData(table.columns, 10),
              executionTime: Math.random() * 0.5 + 0.1 // Random execution time between 0.1 and 0.6 seconds
            };
          } else {
            // Table not found
            throw new Error(`Table '${tableName}' not found`);
          }
        } else if (query.toLowerCase().includes('create') || 
                   query.toLowerCase().includes('insert') || 
                   query.toLowerCase().includes('update') || 
                   query.toLowerCase().includes('delete')) {
          // Mock results for non-SELECT queries
          mockResults = {
            columns: ['Result'],
            rows: [['Operation completed successfully']],
            executionTime: Math.random() * 0.3 + 0.2 // Random execution time between 0.2 and 0.5 seconds
          };
        } else {
          // Unknown query type
          throw new Error('Unsupported query type');
        }
        
        setResults(mockResults);
        onQueryExecute(query);
      } catch (error) {
        console.error('Error executing query:', error);
        
        setResults({
          columns: ['Error'],
          rows: [[error instanceof Error ? error.message : 'Unknown error']],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setIsExecuting(false);
      }
    }, 1000);
  };
  
  /**
   * Generates mock data for a table based on its column definitions
   * @param {Object[]} columns - The column definitions
   * @param {number} count - The number of rows to generate
   * @returns {any[][]} The generated mock data
   */
  const generateMockData = (columns: any[], count: number): any[][] => {
    const rows = [];
    
    for (let i = 0; i < count; i++) {
      const row = columns.map(col => {
        switch (col.type.toLowerCase()) {
          case 'integer':
          case 'int':
          case 'number':
            return Math.floor(Math.random() * 1000);
          case 'decimal':
          case 'float':
          case 'double':
            return (Math.random() * 1000).toFixed(2);
          case 'string':
          case 'varchar':
          case 'text':
            return `Sample ${col.name} ${i + 1}`;
          case 'date':
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            return date.toISOString().split('T')[0];
          case 'datetime':
            const datetime = new Date();
            datetime.setDate(datetime.getDate() - Math.floor(Math.random() * 365));
            return datetime.toISOString();
          case 'boolean':
            return Math.random() > 0.5;
          default:
            return `Sample data ${i + 1}`;
        }
      });
      
      rows.push(row);
    }
    
    return rows;
  };
  
  /**
   * Handles changes to the query text
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event
   */
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };
  
  /**
   * Handles key press events in the editor
   * @param {React.KeyboardEvent<HTMLTextAreaElement>} e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Execute query on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
    
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab character (or spaces)
      const spaces = ' '.repeat(editorSettings.tabSize);
      const newValue = query.substring(0, start) + spaces + query.substring(end);
      
      setQuery(newValue);
      
      // Move cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + editorSettings.tabSize;
      }, 0);
    }
  };
  
  /**
   * Formats the current SQL query
   * In a real implementation, this would use a SQL formatter library
   */
  const formatQuery = () => {
    // Simple SQL formatter (very basic)
    // In a real implementation, this would use a proper SQL formatter library
    const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'ON', 'AND', 'OR', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'INDEX', 'VIEW', 'PROCEDURE', 'FUNCTION', 'TRIGGER'];
    
    let formattedQuery = query.trim();
    
    // Uppercase keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formattedQuery = formattedQuery.replace(regex, keyword);
    });
    
    // Add newlines after keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}\\s+`, 'g');
      formattedQuery = formattedQuery.replace(regex, `${keyword}\n  `);
    });
    
    // Add newlines before AND/OR in WHERE clauses
    formattedQuery = formattedQuery.replace(/\s+(AND|OR)\s+/gi, '\n  $1 ');
    
    // Add newline before closing parenthesis if it's on the same line as other content
    formattedQuery = formattedQuery.replace(/([^\s\(])\)/g, '$1\n)');
    
    setQuery(formattedQuery);
  };
  
  /**
   * Clears the editor and results
   */
  const clearEditor = () => {
    setQuery('');
    setResults(null);
    setEditorIssues([]);
    
    // Focus the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  
  /**
   * Toggles the AI mentor's minimized state
   */
  const toggleMentor = () => {
    setIsMentorMinimized(!isMentorMinimized);
  };
  
  /**
   * Handles hint requests from the AI mentor
   */
  const handleHintRequest = () => {
    onHintRequest();
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="bg-gray-800 p-2 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center space-x-2">
          <button 
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-700"
            onClick={executeQuery}
            disabled={isExecuting}
            title="Execute Query (Ctrl+Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-700"
            onClick={formatQuery}
            title="Format Query"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-gray-700"
            onClick={clearEditor}
            title="Clear Editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="text-sm text-gray-400">
          {editorIssues.length > 0 ? (
            <span className="text-yellow-400">
              {editorIssues.filter(issue => issue.type === 'error').length} errors, {editorIssues.filter(issue => issue.type === 'warning').length} warnings
            </span>
          ) : (
            <span>Ready</span>
          )}
        </div>
      </div>
      
      {/* Editor area */}
      <div className="relative flex-1 bg-gray-900">
        {/* Line numbers */}
        {editorSettings.lineNumbers && (
          <div className="absolute top-0 left-0 bottom-0 w-10 bg-gray-800 text-gray-500 text-right select-none pt-2 px-2">
            {query.split('\n').map((_, i) => (
              <div key={i} className="leading-6">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        
        {/* Editor textarea */}
        <textarea
          ref={editorRef}
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          className={`w-full h-full bg-gray-900 text-white font-mono p-2 focus:outline-none resize-none ${editorSettings.lineNumbers ? 'pl-12' : ''}`}
          style={{ fontSize: `${editorSettings.fontSize}px`, lineHeight: '1.5' }}
          placeholder="Write your SQL query here..."
          spellCheck={false}
        ></textarea>
        
        {/* Error/warning indicators */}
        <div className="absolute top-0 left-0 bottom-0 w-2">
          {editorIssues.map((issue, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full absolute left-0 ${issue.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}
              style={{ top: `${(issue.line * 1.5 * editorSettings.fontSize) + editorSettings.fontSize / 2}px` }}
              title={issue.message}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Results area */}
      <div className="bg-gray-800 p-2 rounded-b-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Results</h3>
          
          {results?.executionTime && (
            <span className="text-xs text-gray-400">
              Executed in {results.executionTime.toFixed(3)}s
            </span>
          )}
        </div>
        
        {isExecuting ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : results ? (
          <div className="overflow-auto max-h-64">
            {results.error ? (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 p-3 rounded">
                <p className="text-red-400 font-medium mb-1">Error</p>
                <p className="text-sm text-gray-300">{results.error}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-700">
                    {results.columns.map((column, index) => (
                      <th key={index} className="p-2 text-left font-medium">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((row, rowIndex) => (
                    <tr 
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
                    >
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="p-2 border-t border-gray-700">
                          {cell === null ? <span className="text-gray-500">NULL</span> : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-500">
            <p>Execute a query to see results</p>
          </div>
        )}
      </div>
      
      {/* AI Mentor */}
      {showMentor && (
        <AIMentor
          currentQuery={query}
          challengeContext={challengeContext}
          playerLevel={playerLevel}
          isMinimized={isMentorMinimized}
          onToggleMinimize={toggleMentor}
          onRequestHint={handleHintRequest}
          hintInfo={hintInfo}
        />
      )}
    </div>
  );
};

export default SQLEditor;
