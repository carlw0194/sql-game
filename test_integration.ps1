# SQL Scenario Game Integration Test Script
# This PowerShell script automates the process of testing the backend and frontend integration

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

# Step 1: Run backend tests
Write-StepHeader "Running Backend Tests"
Set-Location -Path ".\backend"

# Check if pytest is installed
try {
    $pytestVersion = python -c "import pytest; print(pytest.__version__)"
    Write-ColorOutput "Using pytest version $pytestVersion" "Green"
} catch {
    Write-ColorOutput "pytest not found. Installing..." "Yellow"
    python -m pip install pytest
}

# Run the tests
Write-ColorOutput "Running backend unit tests..." "White"
python run_tests.py

# Step 2: Start the backend server in a new PowerShell window
Write-StepHeader "Starting Backend Server"
Write-ColorOutput "Starting backend server in a new window..." "White"

$backendCommand = "cd '$((Get-Location).Path)'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Give the server time to start
Write-ColorOutput "Waiting for backend server to start..." "Yellow"
Start-Sleep -Seconds 5

# Step 3: Start the frontend development server in a new PowerShell window
Write-StepHeader "Starting Frontend Server"
Set-Location -Path "..\frontend"
Write-ColorOutput "Starting frontend development server in a new window..." "White"

$frontendCommand = "cd '$((Get-Location).Path)'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

# Give the server time to start
Write-ColorOutput "Waiting for frontend server to start..." "Yellow"
Start-Sleep -Seconds 5

# Step 4: Open the API test page in the default browser
Write-StepHeader "Opening API Test Page"
Write-ColorOutput "Opening API test page in browser..." "White"

# The URL will depend on your frontend routing
$testUrl = "http://localhost:5173/api-test"
Start-Process $testUrl

# Final instructions
Write-StepHeader "Integration Test Running"
Write-ColorOutput "Integration test environment is now running!" "Green"
Write-ColorOutput "Backend API: http://localhost:8000" "White"
Write-ColorOutput "Frontend: http://localhost:5173" "White"
Write-ColorOutput "API Test Page: $testUrl" "White"
Write-ColorOutput "`nTo stop the servers, close the PowerShell windows that were opened." "Yellow"
Write-ColorOutput "Press any key to exit this script..." "Gray"
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
