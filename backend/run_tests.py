"""
Test Runner Script for SQL Scenario Game Backend

This script runs the backend tests and provides a summary of the results.
It can also start the backend server for manual testing or frontend integration.

Usage:
    python run_tests.py [--server]

Options:
    --server    Start the backend server after running tests
"""

import argparse
import subprocess
import sys
import os
import time

def run_backend_tests():
    """
    Run the backend unit tests using pytest.
    
    This function executes the pytest command to run all tests in the tests directory
    and returns the result code.
    
    Returns:
        int: The pytest result code (0 for success, non-zero for failure)
    """
    print("Running backend tests...")
    
    # Run pytest with verbose output
    result = subprocess.run(
        ["pytest", "-xvs", "tests/"],
        capture_output=True,
        text=True
    )
    
    # Print test output
    print("\n--- Test Output ---")
    print(result.stdout)
    
    if result.stderr:
        print("\n--- Test Errors ---")
        print(result.stderr)
    
    # Print summary
    if result.returncode == 0:
        print("\n✅ All tests passed successfully!")
    else:
        print(f"\n❌ Tests failed with return code {result.returncode}")
    
    return result.returncode

def start_backend_server():
    """
    Start the backend server using uvicorn.
    
    This function starts the FastAPI backend server on localhost:8000
    and keeps it running until interrupted.
    """
    print("\nStarting backend server...")
    print("Server will be available at http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    
    try:
        # Start the server with uvicorn
        subprocess.run(
            ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
            check=True
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\nServer failed to start: {e}")
        return 1
    
    return 0

def main():
    """
    Main function to parse arguments and run tests or server.
    """
    parser = argparse.ArgumentParser(description="Run backend tests for SQL Scenario Game")
    parser.add_argument("--server", action="store_true", help="Start the backend server after running tests")
    
    args = parser.parse_args()
    
    # Run tests
    test_result = run_backend_tests()
    
    # Start server if requested
    if args.server and test_result == 0:
        return start_backend_server()
    
    return test_result

if __name__ == "__main__":
    sys.exit(main())
