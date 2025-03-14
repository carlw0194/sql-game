import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

/**
 * ApiTest Component
 * 
 * This component tests the connection between the frontend and backend API.
 * It attempts to:
 * 1. Register a test user
 * 2. Login with the test user
 * 3. Fetch user profile data
 * 4. Fetch challenges
 * 
 * The component displays the results of each test, making it easy to verify
 * that the frontend can successfully communicate with the backend.
 */
const ApiTest: React.FC = () => {
  // State to store test results
  const [results, setResults] = useState<{
    register: string;
    login: string;
    profile: string;
    challenges: string;
  }>({
    register: 'Not tested',
    login: 'Not tested',
    profile: 'Not tested',
    challenges: 'Not tested',
  });

  // State to store the auth token
  const [token, setToken] = useState<string | null>(null);

  // API base URL
  const API_URL = 'http://localhost:8000/api';

  /**
   * Helper function to extract error messages from API errors
   * 
   * @param error - The error object from an API request
   * @returns A string representation of the error message
   */
  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Use type assertion to tell TypeScript that data might have a detail property
      const errorData = axiosError.response?.data as { detail?: string };
      return errorData?.detail || axiosError.message || 'Unknown API error';
    }
    return 'Unknown error';
  };

  /**
   * Run all API tests in sequence
   * 
   * This function tests the complete flow from registration to fetching
   * protected resources, displaying the results of each step.
   */
  const runTests = async () => {
    try {
      // Test user data
      const testUser = {
        username: `testuser_${Date.now()}`, // Ensure unique username
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword',
        display_name: 'Test User',
      };

      // Test 1: Register
      try {
        const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
        setResults(prev => ({
          ...prev,
          register: `Success: User ${registerResponse.data.username} registered`,
        }));
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          setResults(prev => ({
            ...prev,
            register: 'User already exists, continuing with login test',
          }));
        } else {
          throw error;
        }
      }

      // Test 2: Login
      try {
        const loginResponse = await axios.post(
          `${API_URL}/auth/login`,
          new URLSearchParams({
            username: testUser.username,
            password: testUser.password,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        const authToken = loginResponse.data.access_token;
        setToken(authToken);
        
        setResults(prev => ({
          ...prev,
          login: `Success: Token received (${authToken.substring(0, 15)}...)`,
        }));
      } catch (error: unknown) {
        setResults(prev => ({
          ...prev,
          login: `Error: ${getErrorMessage(error)}`,
        }));
        throw error; // Stop tests if login fails
      }

      // Test 3: Get user profile
      try {
        const profileResponse = await axios.get(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setResults(prev => ({
          ...prev,
          profile: `Success: Retrieved profile for ${profileResponse.data.username}`,
        }));
      } catch (error: unknown) {
        setResults(prev => ({
          ...prev,
          profile: `Error: ${getErrorMessage(error)}`,
        }));
      }

      // Test 4: Get challenges
      try {
        const challengesResponse = await axios.get(`${API_URL}/challenges/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setResults(prev => ({
          ...prev,
          challenges: `Success: Retrieved ${challengesResponse.data.length} challenges`,
        }));
      } catch (error: unknown) {
        setResults(prev => ({
          ...prev,
          challenges: `Error: ${getErrorMessage(error)}`,
        }));
      }
    } catch (error: unknown) {
      console.error('Test suite error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">API Integration Test</h1>
      
      <button
        onClick={runTests}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Run API Tests
      </button>
      
      <div className="space-y-4">
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Register Test</h2>
          <p className={`text-sm ${results.register.includes('Success') ? 'text-green-400' : 'text-yellow-400'}`}>
            {results.register}
          </p>
        </div>
        
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Login Test</h2>
          <p className={`text-sm ${results.login.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {results.login}
          </p>
        </div>
        
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Profile Test</h2>
          <p className={`text-sm ${results.profile.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {results.profile}
          </p>
        </div>
        
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold text-white mb-2">Challenges Test</h2>
          <p className={`text-sm ${results.challenges.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {results.challenges}
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-400">
        <p>
          Note: These tests verify that the frontend can communicate with the backend API.
          Make sure the backend server is running on http://localhost:8000 before running these tests.
        </p>
      </div>
    </div>
  );
};

export default ApiTest;
