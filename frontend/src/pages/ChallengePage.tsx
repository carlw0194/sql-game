import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import SQLEditor from '../components/editor/SQLEditor';
import SchemaViewer from '../components/database/SchemaViewer';
import { getPlayerProfile, getLevelById, submitSolution } from '../services/gameService';
import { Player, Level } from '../types';

/**
 * ChallengePage Component
 * 
 * This component represents the main gameplay screen where players solve SQL challenges.
 * It displays the challenge details, database schema, and provides an SQL editor
 * for writing and executing queries. Players can submit their solutions and receive
 * feedback on their performance.
 * 
 * Key features:
 * 1. Challenge description and scenario
 * 2. Database schema visualization
 * 3. SQL editor with syntax highlighting and error checking
 * 4. Query execution with results display
 * 5. Hint system with progressive assistance
 * 6. Solution submission and feedback
 * 
 * The challenge difficulty adapts based on the player's progress, providing an
 * engaging learning experience for SQL concepts.
 * 
 * @returns {JSX.Element} The rendered challenge page
 */
const ChallengePage = () => {
  // Get level ID from URL params
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  
  // State for player data
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  
  // State for level/challenge data
  const [level, setLevel] = useState<Level | null>(null);
  const [isLoadingLevel, setIsLoadingLevel] = useState(true);
  
  // State for SQL editor
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // State for hints
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHints, setShowHints] = useState(false);
  
  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    feedback: string;
    xpEarned: number;
  } | null>(null);
  
  // State for schema visualization
  const [showSchema, setShowSchema] = useState(true);
  
  /**
   * Loads the player profile data
   */
  useEffect(() => {
    const loadPlayerData = async () => {
      setIsLoadingPlayer(true);
      try {
        const data = await getPlayerProfile();
        setPlayer(data);
      } catch (error) {
        console.error('Error loading player data:', error);
      } finally {
        setIsLoadingPlayer(false);
      }
    };
    
    loadPlayerData();
  }, []);
  
  /**
   * Loads the level and challenge data
   */
  useEffect(() => {
    const loadLevelData = async () => {
      if (!levelId) return;
      
      setIsLoadingLevel(true);
      
      try {
        const levelData = await getLevelById(Number(levelId));
        setLevel(levelData);
        
        // Initialize editor with the challenge's initial query if provided
        if (levelData.challenge?.initialQuery) {
          setQuery(levelData.challenge.initialQuery);
        }
      } catch (error) {
        console.error('Error loading level data:', error);
      } finally {
        setIsLoadingLevel(false);
      }
    };
    
    loadLevelData();
  }, [levelId]);
  
  /**
   * Handles query execution from the SQL editor
   * @param {string} executedQuery - The query that was executed
   */
  const handleQueryExecute = (executedQuery: string) => {
    // In a real implementation, this would send the query to a backend
    // for execution and return results to display in the editor
    console.log('Query executed:', executedQuery);
    
    // Update the current query
    setQuery(executedQuery);
  };
  
  /**
   * Handles hint requests from the SQL editor
   */
  const handleHintRequest = () => {
    if (!level?.challenge?.hints || hintsUsed >= level.challenge.hints.length) return;
    
    setHintsUsed(prev => prev + 1);
  };
  
  /**
   * Submits the current query as a solution to the challenge
   */
  const handleSubmitSolution = async () => {
    if (!levelId || !query.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await submitSolution(Number(levelId), query);
      setSubmissionResult(result);
      
      // If the score is good enough, navigate to the results page
      if (result.score >= 70) {
        // Wait a moment to show the success message
        setTimeout(() => {
          navigate(`/challenge-results/${levelId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Toggles the visibility of the database schema
   */
  const toggleSchema = () => {
    setShowSchema(!showSchema);
  };
  
  /**
   * Toggles the visibility of the hints panel
   */
  const toggleHints = () => {
    setShowHints(!showHints);
  };
  
  /**
   * Returns to the career mode page
   */
  const returnToCareerMode = () => {
    navigate('/career');
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <button 
          className="text-gray-400 hover:text-white flex items-center mb-4"
          onClick={returnToCareerMode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Career Mode
        </button>
        
        <h1 className="text-3xl font-bold mb-2">
          {isLoadingLevel ? 'Loading Challenge...' : level?.name}
        </h1>
        {level && (
          <p className="text-gray-300">
            {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)} • {level.challenge?.title}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Challenge details and schema */}
        <div className="lg:col-span-1">
          {isLoadingLevel ? (
            <div className="card animate-pulse">
              <div className="h-8 bg-gray-700 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-full"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded mb-2 w-4/5"></div>
            </div>
          ) : level ? (
            <>
              {/* Challenge description */}
              <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4">Challenge Description</h2>
                <p className="text-gray-300 mb-4">
                  {level.challenge?.description}
                </p>
                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="text-lg font-medium mb-2">Scenario</h3>
                  <p className="text-gray-300">
                    {level.challenge?.scenario}
                  </p>
                </div>
              </div>
              
              {/* Database schema */}
              <div className="card mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Database Schema</h2>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={toggleSchema}
                  >
                    {showSchema ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showSchema && level.challenge?.schema?.tables && (
                  <SchemaViewer 
                    tables={level.challenge.schema.tables}
                    showRowCount={true}
                    showRelationships={true}
                    allowCollapse={true}
                    className="mt-2"
                  />
                )}
              </div>
              
              {/* Hints panel */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Hints</h2>
                  <button 
                    className="text-gray-400 hover:text-white"
                    onClick={toggleHints}
                  >
                    {showHints ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showHints && (
                  <div className="space-y-3">
                    {level.challenge?.hints?.slice(0, hintsUsed).map((hint, index) => (
                      <div 
                        key={index}
                        className="bg-primary bg-opacity-20 border border-primary border-opacity-30 p-3 rounded"
                      >
                        <p className="text-primary">{hint}</p>
                      </div>
                    ))}
                    
                    {hintsUsed < (level.challenge?.hints?.length || 0) && (
                      <button 
                        className="btn-primary w-full py-2"
                        onClick={() => setHintsUsed(prev => prev + 1)}
                      >
                        Reveal Hint ({hintsUsed + 1}/{level.challenge?.hints?.length || 0})
                      </button>
                    )}
                    
                    {hintsUsed === 0 && (
                      <p className="text-gray-400 text-sm">
                        Need help? Reveal hints to guide you through the challenge, but note that using hints may reduce your final score.
                      </p>
                    )}
                    
                    {hintsUsed === (level.challenge?.hints?.length || 0) && (
                      <p className="text-gray-400 text-sm">
                        You've used all available hints for this challenge.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card">
              <p className="text-gray-400">Challenge not found. Please return to Career Mode and select a valid challenge.</p>
              <button 
                className="btn-primary mt-4"
                onClick={returnToCareerMode}
              >
                Return to Career Mode
              </button>
            </div>
          )}
        </div>
        
        {/* Right column: SQL editor and submission */}
        <div className="lg:col-span-2">
          {isLoadingLevel ? (
            <div className="card animate-pulse h-96">
              <div className="h-8 bg-gray-700 rounded mb-4 w-1/4"></div>
              <div className="h-64 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
          ) : level ? (
            <div className="card h-full">
              <h2 className="text-xl font-semibold mb-4">SQL Editor</h2>
              
              <div className="h-[600px]">
                <SQLEditor
                  initialQuery={query}
                  challengeContext={{
                    tables: level.challenge?.schema?.tables || [],
                    scenario: level.challenge?.scenario || '',
                    difficulty: level.difficulty as any,
                    expectedColumns: level.challenge?.expectedSolution?.criteria?.requiredColumns
                  }}
                  playerLevel={player?.level || 1}
                  onQueryExecute={handleQueryExecute}
                  onHintRequest={handleHintRequest}
                  hintInfo={{
                    used: hintsUsed,
                    available: level.challenge?.hints?.length || 0
                  }}
                  showMentor={true}
                  editorSettings={{
                    fontSize: 14,
                    tabSize: 2,
                    lineNumbers: true,
                    darkMode: true,
                    autoComplete: true
                  }}
                />
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  {submissionResult && (
                    <div className={`p-3 rounded ${
                      submissionResult.score >= 80 ? 'bg-green-900 bg-opacity-30 border border-green-700' :
                      submissionResult.score >= 60 ? 'bg-blue-900 bg-opacity-30 border border-blue-700' :
                      submissionResult.score >= 40 ? 'bg-yellow-900 bg-opacity-30 border border-yellow-700' :
                      'bg-red-900 bg-opacity-30 border border-red-700'
                    }`}>
                      <div className="flex items-center mb-1">
                        <span className={`text-lg font-bold mr-2 ${
                          submissionResult.score >= 80 ? 'text-green-400' :
                          submissionResult.score >= 60 ? 'text-blue-400' :
                          submissionResult.score >= 40 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          Score: {submissionResult.score}
                        </span>
                        <span className="text-gray-300">
                          (+{submissionResult.xpEarned} XP)
                        </span>
                      </div>
                      <p className="text-gray-300">{submissionResult.feedback}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    className="btn-secondary"
                    onClick={returnToCareerMode}
                  >
                    Cancel
                  </button>
                  
                  <button 
                    className="btn-primary"
                    onClick={handleSubmitSolution}
                    disabled={isSubmitting || !query.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Solution'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <p className="text-gray-400">Editor not available. Please select a valid challenge.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChallengePage;
