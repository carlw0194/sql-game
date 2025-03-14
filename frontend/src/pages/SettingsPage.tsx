import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getPlayerProfile } from '../services/gameService';
import { Player } from '../types';

/**
 * SettingsPage Component
 * 
 * This component provides a user interface for configuring game settings and preferences.
 * It allows players to customize their experience by adjusting various options related to
 * gameplay, appearance, and account settings.
 * 
 * Key features:
 * 1. Theme selection (dark/light mode)
 * 2. Editor preferences (font size, auto-complete, etc.)
 * 3. Gameplay settings (difficulty, hints, etc.)
 * 4. Account management (profile editing, password change)
 * 
 * The settings are organized into logical sections for better usability, and changes
 * are saved automatically or via a save button depending on the setting type.
 * 
 * @returns {JSX.Element} The rendered settings page
 */
const SettingsPage = () => {
  const navigate = useNavigate();
  
  // State for player data and loading status
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);
  
  // State for settings
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    autoComplete: true,
    wordWrap: true,
    showLineNumbers: true,
    highlightActiveLine: true
  });
  
  const [gameplaySettings, setGameplaySettings] = useState({
    difficulty: 'intermediate',
    showHints: true,
    showExecutionPlan: true,
    showPerformanceMetrics: true,
    autoSaveQueries: true
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    accentColor: 'blue',
    animationsEnabled: true,
    compactMode: false
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    challengeReminders: true,
    newBadgeAlerts: true,
    levelUpNotifications: true,
    multiplayerInvites: true
  });
  
  // State for form submission
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  /**
   * Loads the player profile data
   * In a real implementation, this would connect to a backend service
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
   * Handles changes to editor settings
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event
   */
  const handleEditorSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditorSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle numeric inputs
      if (type === 'number') {
        setEditorSettings(prev => ({
          ...prev,
          [name]: parseInt(value)
        }));
      } else {
        // Handle other inputs
        setEditorSettings(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };
  
  /**
   * Handles changes to gameplay settings
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event
   */
  const handleGameplaySettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setGameplaySettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle other inputs
      setGameplaySettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  /**
   * Handles changes to appearance settings
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The change event
   */
  const handleAppearanceSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs differently
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAppearanceSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle other inputs
      setAppearanceSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  /**
   * Handles changes to notification settings
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleNotificationSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  /**
   * Saves all settings
   * In a real implementation, this would connect to a backend service
   */
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful save
      setSaveMessage({
        type: 'success',
        text: 'Settings saved successfully'
      });
      
      // In a real implementation, this would send the settings to a backend service
      console.log('Saving settings:', {
        editorSettings,
        gameplaySettings,
        appearanceSettings,
        notificationSettings
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.'
      });
    } finally {
      setIsSaving(false);
      
      // Clear success message after a delay
      if (saveMessage?.type === 'success') {
        setTimeout(() => {
          setSaveMessage(null);
        }, 3000);
      }
    }
  };
  
  /**
   * Resets all settings to defaults
   */
  const resetSettings = () => {
    // Reset to default values
    setEditorSettings({
      fontSize: 14,
      tabSize: 2,
      autoComplete: true,
      wordWrap: true,
      showLineNumbers: true,
      highlightActiveLine: true
    });
    
    setGameplaySettings({
      difficulty: 'intermediate',
      showHints: true,
      showExecutionPlan: true,
      showPerformanceMetrics: true,
      autoSaveQueries: true
    });
    
    setAppearanceSettings({
      theme: 'dark',
      accentColor: 'blue',
      animationsEnabled: true,
      compactMode: false
    });
    
    setNotificationSettings({
      challengeReminders: true,
      newBadgeAlerts: true,
      levelUpNotifications: true,
      multiplayerInvites: true
    });
    
    setSaveMessage({
      type: 'success',
      text: 'Settings reset to defaults'
    });
    
    // Clear success message after a delay
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <button 
          className="text-gray-400 hover:text-white flex items-center mb-4"
          onClick={() => navigate('/')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>
        
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-300">
          Customize your SQL Scenario experience with these settings.
        </p>
      </div>
      
      {/* Settings form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Account settings */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            
            {isLoadingPlayer ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : player ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold mr-4">
                    {player.avatarUrl ? (
                      <img 
                        src={player.avatarUrl} 
                        alt={player.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      player.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">{player.username}</h3>
                    <p className="text-gray-400 text-sm">Level {player.level} • {player.title}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button className="btn-secondary w-full">
                    Edit Profile
                  </button>
                  <button className="btn-secondary w-full">
                    Change Password
                  </button>
                  <button className="btn-secondary w-full">
                    Manage Subscription
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Failed to load account data</p>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="challengeReminders" className="text-sm">
                  Challenge Reminders
                </label>
                <input
                  type="checkbox"
                  id="challengeReminders"
                  name="challengeReminders"
                  checked={notificationSettings.challengeReminders}
                  onChange={handleNotificationSettingChange}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="newBadgeAlerts" className="text-sm">
                  New Badge Alerts
                </label>
                <input
                  type="checkbox"
                  id="newBadgeAlerts"
                  name="newBadgeAlerts"
                  checked={notificationSettings.newBadgeAlerts}
                  onChange={handleNotificationSettingChange}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="levelUpNotifications" className="text-sm">
                  Level Up Notifications
                </label>
                <input
                  type="checkbox"
                  id="levelUpNotifications"
                  name="levelUpNotifications"
                  checked={notificationSettings.levelUpNotifications}
                  onChange={handleNotificationSettingChange}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="multiplayerInvites" className="text-sm">
                  Multiplayer Invites
                </label>
                <input
                  type="checkbox"
                  id="multiplayerInvites"
                  name="multiplayerInvites"
                  checked={notificationSettings.multiplayerInvites}
                  onChange={handleNotificationSettingChange}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Game settings */}
        <div className="lg:col-span-2">
          {/* Editor settings */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">SQL Editor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="fontSize" className="block mb-1 text-sm">
                  Font Size
                </label>
                <input
                  type="number"
                  id="fontSize"
                  name="fontSize"
                  value={editorSettings.fontSize}
                  onChange={handleEditorSettingChange}
                  min={10}
                  max={24}
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label htmlFor="tabSize" className="block mb-1 text-sm">
                  Tab Size
                </label>
                <input
                  type="number"
                  id="tabSize"
                  name="tabSize"
                  value={editorSettings.tabSize}
                  onChange={handleEditorSettingChange}
                  min={1}
                  max={8}
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoComplete"
                  name="autoComplete"
                  checked={editorSettings.autoComplete}
                  onChange={handleEditorSettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="autoComplete" className="text-sm">
                  Enable Auto-Complete
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wordWrap"
                  name="wordWrap"
                  checked={editorSettings.wordWrap}
                  onChange={handleEditorSettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="wordWrap" className="text-sm">
                  Enable Word Wrap
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showLineNumbers"
                  name="showLineNumbers"
                  checked={editorSettings.showLineNumbers}
                  onChange={handleEditorSettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="showLineNumbers" className="text-sm">
                  Show Line Numbers
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highlightActiveLine"
                  name="highlightActiveLine"
                  checked={editorSettings.highlightActiveLine}
                  onChange={handleEditorSettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="highlightActiveLine" className="text-sm">
                  Highlight Active Line
                </label>
              </div>
            </div>
          </div>
          
          {/* Gameplay settings */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Gameplay</h2>
            
            <div className="mb-4">
              <label htmlFor="difficulty" className="block mb-1 text-sm">
                Default Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={gameplaySettings.difficulty}
                onChange={handleGameplaySettingChange}
                className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showHints"
                  name="showHints"
                  checked={gameplaySettings.showHints}
                  onChange={handleGameplaySettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="showHints" className="text-sm">
                  Show Hints During Challenges
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showExecutionPlan"
                  name="showExecutionPlan"
                  checked={gameplaySettings.showExecutionPlan}
                  onChange={handleGameplaySettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="showExecutionPlan" className="text-sm">
                  Show Query Execution Plan
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPerformanceMetrics"
                  name="showPerformanceMetrics"
                  checked={gameplaySettings.showPerformanceMetrics}
                  onChange={handleGameplaySettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="showPerformanceMetrics" className="text-sm">
                  Show Performance Metrics
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSaveQueries"
                  name="autoSaveQueries"
                  checked={gameplaySettings.autoSaveQueries}
                  onChange={handleGameplaySettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="autoSaveQueries" className="text-sm">
                  Auto-Save Queries
                </label>
              </div>
            </div>
          </div>
          
          {/* Appearance settings */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="theme" className="block mb-1 text-sm">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={appearanceSettings.theme}
                  onChange={handleAppearanceSettingChange}
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="accentColor" className="block mb-1 text-sm">
                  Accent Color
                </label>
                <select
                  id="accentColor"
                  name="accentColor"
                  value={appearanceSettings.accentColor}
                  onChange={handleAppearanceSettingChange}
                  className="w-full bg-gray-700 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="animationsEnabled"
                  name="animationsEnabled"
                  checked={appearanceSettings.animationsEnabled}
                  onChange={handleAppearanceSettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="animationsEnabled" className="text-sm">
                  Enable Animations
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="compactMode"
                  name="compactMode"
                  checked={appearanceSettings.compactMode}
                  onChange={handleAppearanceSettingChange}
                  className="h-4 w-4 mr-2"
                />
                <label htmlFor="compactMode" className="text-sm">
                  Compact Mode
                </label>
              </div>
            </div>
          </div>
          
          {/* Save/Reset buttons */}
          <div className="flex justify-between items-center">
            <button 
              className="btn-secondary"
              onClick={resetSettings}
            >
              Reset to Defaults
            </button>
            
            <div className="flex items-center">
              {saveMessage && (
                <span className={`mr-4 ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {saveMessage.text}
                </span>
              )}
              
              <button 
                className="btn-primary"
                onClick={saveSettings}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
