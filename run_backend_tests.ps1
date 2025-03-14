# SQL Scenario Game Backend Test Script
# This PowerShell script runs the backend tests directly with pytest

# Define color output functions for better readability
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-StepHeader {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Step
    )
    
    Write-Host "`n========== $Step ==========" -ForegroundColor Cyan
}

# Set the working directory to the backend folder
Set-Location -Path ".\backend"

# Step 1: Run the authentication tests
Write-StepHeader "Running Authentication Tests"
Write-ColorOutput "Running tests for authentication endpoints..." "White"
pytest -xvs tests/test_auth.py

# Step 2: Run the challenge tests
Write-StepHeader "Running Challenge Tests"
Write-ColorOutput "Running tests for challenge endpoints..." "White"
pytest -xvs tests/test_challenges.py

# Step 3: Run the leaderboard tests
Write-StepHeader "Running Leaderboard Tests"
Write-ColorOutput "Running tests for leaderboard endpoints..." "White"
pytest -xvs tests/test_leaderboard.py

# Step 4: Run the integration tests
Write-StepHeader "Running Integration Tests"
Write-ColorOutput "Running integration tests for frontend-backend communication..." "White"
pytest -xvs tests/test_integration.py

# Final message
Write-StepHeader "Test Run Complete"
Write-ColorOutput "All backend tests have been executed." "Green"
Write-ColorOutput "Check the output above for any test failures." "Yellow"
Write-ColorOutput "Press any key to exit..." "Gray"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
