import { useState, useEffect } from 'react';

/**
 * AIMentor Component
 * 
 * This component provides an AI-driven assistant to help players learn SQL concepts
 * and improve their query writing skills. It offers contextual guidance, explanations,
 * and suggestions based on the player's current challenge or query.
 * 
 * Key features:
 * 1. Query analysis and suggestions
 * 2. Concept explanations with examples
 * 3. Interactive learning through guided hints
 * 4. Performance optimization tips
 * 
 * The AI Mentor adapts to the player's skill level, providing more detailed explanations
 * for beginners and more advanced tips for experienced players. This creates a
 * personalized learning experience that helps players improve their SQL skills efficiently.
 * 
 * @param {AIMentorProps} props - Component properties
 * @returns {JSX.Element} The rendered AI Mentor component
 */
type AIMentorProps = {
  // The current SQL query being written by the player
  currentQuery?: string;
  
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
    }[];
    scenario: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  
  // The player's skill level
  playerLevel?: number;
  
  // Whether the mentor is minimized
  isMinimized?: boolean;
  
  // Function to toggle the mentor's minimized state
  onToggleMinimize?: () => void;
  
  // Function to request a hint from the mentor
  onRequestHint?: () => void;
  
  // The current hint count and maximum available hints
  hintInfo?: {
    used: number;
    available: number;
  };
};

const AIMentor = ({
  currentQuery = '',
  challengeContext,
  playerLevel = 1,
  isMinimized = false,
  onToggleMinimize = () => {},
  onRequestHint = () => {},
  hintInfo = { used: 0, available: 3 }
}: AIMentorProps) => {
  // State for mentor messages
  const [messages, setMessages] = useState<{
    id: string;
    text: string;
    type: 'info' | 'hint' | 'warning' | 'error' | 'success';
    timestamp: Date;
  }[]>([]);
  
  // State for loading status when generating a response
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for user input in the question field
  const [userQuestion, setUserQuestion] = useState('');
  
  /**
   * Analyzes the current query and provides feedback
   * In a real implementation, this would connect to an AI service
   */
  useEffect(() => {
    if (!currentQuery || currentQuery.trim() === '') return;
    
    // Only analyze complete queries that end with a semicolon
    if (!currentQuery.trim().endsWith(';')) return;
    
    // Simple analysis based on common SQL patterns
    const analyzeQuery = async () => {
      // Wait a bit to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const lowerQuery = currentQuery.toLowerCase();
      
      // Check for SELECT *
      if (lowerQuery.includes('select *') && !lowerQuery.includes('limit')) {
        addMessage({
          id: Date.now().toString(),
          text: "I noticed you're using 'SELECT *' without a LIMIT clause. For large tables, it's usually better to select only the columns you need and limit the number of rows returned.",
          type: 'info',
          timestamp: new Date()
        });
      }
      
      // Check for missing WHERE clause in UPDATE or DELETE
      if ((lowerQuery.includes('update ') || lowerQuery.includes('delete from ')) && 
          !lowerQuery.includes('where')) {
        addMessage({
          id: Date.now().toString(),
          text: "Warning: You're performing an UPDATE or DELETE without a WHERE clause. This will affect all rows in the table. Is that what you intended?",
          type: 'warning',
          timestamp: new Date()
        });
      }
      
      // Check for JOIN without ON clause
      if (lowerQuery.includes('join') && !lowerQuery.includes('on ')) {
        addMessage({
          id: Date.now().toString(),
          text: "Your query includes a JOIN but I don't see an ON clause. Make sure to specify the join condition to avoid a cartesian product.",
          type: 'warning',
          timestamp: new Date()
        });
      }
      
      // Check for GROUP BY without aggregation
      if (lowerQuery.includes('group by') && 
          !lowerQuery.includes('count(') && 
          !lowerQuery.includes('sum(') && 
          !lowerQuery.includes('avg(') && 
          !lowerQuery.includes('min(') && 
          !lowerQuery.includes('max(')) {
        addMessage({
          id: Date.now().toString(),
          text: "You're using GROUP BY but I don't see any aggregation functions (COUNT, SUM, AVG, MIN, MAX). GROUP BY is typically used with aggregation functions.",
          type: 'info',
          timestamp: new Date()
        });
      }
    };
    
    // Only analyze if we have context and the query is non-trivial
    if (challengeContext && currentQuery.length > 10) {
      analyzeQuery();
    }
  }, [currentQuery, challengeContext]);
  
  /**
   * Adds a new message to the mentor's message list
   * @param {Object} message - The message to add
   */
  const addMessage = (message: {
    id: string;
    text: string;
    type: 'info' | 'hint' | 'warning' | 'error' | 'success';
    timestamp: Date;
  }) => {
    setMessages(prev => [...prev, message]);
  };
  
  /**
   * Clears all messages from the mentor
   */
  const clearMessages = () => {
    setMessages([]);
  };
  
  /**
   * Handles submitting a question to the AI Mentor
   * In a real implementation, this would connect to an AI service
   */
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userQuestion.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a response based on the question
      // In a real implementation, this would use an AI service
      let response = '';
      
      if (userQuestion.toLowerCase().includes('index')) {
        response = "Indexes are special lookup tables that the database search engine can use to speed up data retrieval. They work similar to a book's index - instead of looking through the entire book, you can find information quickly in the index. In SQL, you can create an index using CREATE INDEX statement. For example: CREATE INDEX idx_lastname ON Employees(LastName);";
      } else if (userQuestion.toLowerCase().includes('join')) {
        response = "SQL JOINs are used to combine rows from two or more tables based on a related column. The main types are: INNER JOIN (returns records with matching values in both tables), LEFT JOIN (returns all records from the left table and matched records from the right), RIGHT JOIN (opposite of LEFT), and FULL JOIN (returns all records when there's a match in either table).";
      } else if (userQuestion.toLowerCase().includes('group by')) {
        response = "The GROUP BY statement groups rows that have the same values into summary rows. It's often used with aggregate functions (COUNT, MAX, MIN, SUM, AVG) to group the result-set by one or more columns. For example: SELECT Department, COUNT(EmployeeID) FROM Employees GROUP BY Department;";
      } else if (userQuestion.toLowerCase().includes('subquery')) {
        response = "A subquery is a query nested inside another query. It can be used in SELECT, INSERT, UPDATE, or DELETE statements with operators like =, <, >, >=, <=, IN, etc. For example: SELECT EmployeeName FROM Employees WHERE DepartmentID IN (SELECT DepartmentID FROM Departments WHERE Location = 'New York');";
      } else {
        response = "That's a great question about SQL! To give you the most helpful answer, could you provide a bit more context about what you're trying to accomplish? I can help with query optimization, database design, specific SQL syntax, or best practices.";
      }
      
      addMessage({
        id: Date.now().toString(),
        text: response,
        type: 'info',
        timestamp: new Date()
      });
      
      setUserQuestion('');
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      addMessage({
        id: Date.now().toString(),
        text: "I'm having trouble processing your question right now. Please try again later.",
        type: 'error',
        timestamp: new Date()
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  /**
   * Requests a hint from the AI Mentor
   * In a real implementation, this would connect to an AI service
   */
  const requestHint = () => {
    if (hintInfo.used >= hintInfo.available) {
      addMessage({
        id: Date.now().toString(),
        text: "You've used all available hints for this challenge. Try working through the problem with what you've learned so far!",
        type: 'warning',
        timestamp: new Date()
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate a hint based on the challenge context
      // In a real implementation, this would use an AI service
      let hint = '';
      
      if (challengeContext) {
        if (challengeContext.difficulty === 'beginner') {
          hint = "For this challenge, start by thinking about which tables contain the data you need. Look at the relationships between tables and consider using a JOIN to combine related data.";
        } else if (challengeContext.difficulty === 'intermediate') {
          hint = "Consider using a subquery or a common table expression (CTE) to break down this problem into smaller steps. Also, think about which columns would benefit from indexing to improve query performance.";
        } else {
          hint = "This is an advanced challenge! Think about query optimization - consider the execution plan, proper indexing, and whether your joins are in the optimal order. You might need to use window functions or advanced SQL features.";
        }
      } else {
        hint = "Try breaking down your problem into smaller parts. What tables do you need to query? What conditions do you need to apply? What results are you expecting?";
      }
      
      addMessage({
        id: Date.now().toString(),
        text: hint,
        type: 'hint',
        timestamp: new Date()
      });
      
      // Call the parent component's hint handler
      onRequestHint();
      
      setIsGenerating(false);
    }, 1000);
  };
  
  /**
   * Formats the timestamp for display
   * @param {Date} date - The timestamp to format
   * @returns {string} The formatted timestamp
   */
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // If minimized, show only the header
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-16 h-16 bg-primary rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors z-50" onClick={onToggleMinimize}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-surface rounded-lg shadow-lg overflow-hidden z-50 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="bg-primary p-3 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <h3 className="text-white font-medium">SQL Mentor</h3>
        </div>
        
        <div className="flex">
          <button 
            className="text-white hover:text-gray-200 mr-2"
            onClick={clearMessages}
            title="Clear messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          
          <button 
            className="text-white hover:text-gray-200"
            onClick={onToggleMinimize}
            title="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p>I'm your SQL Mentor! Ask me a question or request a hint to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === 'info' ? 'bg-gray-800' : 
                  message.type === 'hint' ? 'bg-primary bg-opacity-20 border border-primary border-opacity-30' : 
                  message.type === 'warning' ? 'bg-yellow-900 bg-opacity-30 border border-yellow-700' : 
                  message.type === 'error' ? 'bg-red-900 bg-opacity-30 border border-red-700' : 
                  'bg-green-900 bg-opacity-30 border border-green-700'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-medium ${
                    message.type === 'info' ? 'text-blue-400' : 
                    message.type === 'hint' ? 'text-primary' : 
                    message.type === 'warning' ? 'text-yellow-400' : 
                    message.type === 'error' ? 'text-red-400' : 
                    'text-green-400'
                  }`}>
                    {message.type === 'info' ? 'Info' : 
                     message.type === 'hint' ? 'Hint' : 
                     message.type === 'warning' ? 'Warning' : 
                     message.type === 'error' ? 'Error' : 
                     'Success'}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-200">{message.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Hint button */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <button 
            className="btn-primary text-sm py-1 px-3"
            onClick={requestHint}
            disabled={isGenerating || hintInfo.used >= hintInfo.available}
          >
            {isGenerating ? 'Generating...' : `Request Hint (${hintInfo.used}/${hintInfo.available})`}
          </button>
          
          <div className="text-xs text-gray-400">
            Level: {playerLevel}
          </div>
        </div>
        
        {/* Question input */}
        <form onSubmit={handleQuestionSubmit} className="flex">
          <input
            type="text"
            placeholder="Ask a SQL question..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            className="flex-1 bg-gray-700 text-white rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isGenerating}
          />
          <button 
            type="submit"
            className="bg-primary text-white rounded-r-md px-3 py-2 text-sm hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            disabled={isGenerating || !userQuestion.trim()}
          >
            {isGenerating ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIMentor;
