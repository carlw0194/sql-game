# PostgreSQL Setup Script for SQL Game
# This script helps set up and configure PostgreSQL for the SQL Game project

# Configuration variables
$PG_DATABASE = "sql_game"
$PG_USER = "postgres"
$PG_PASSWORD = "password"  # Change this in production
$PG_HOST = "localhost"
$PG_PORT = "5432"

Write-Host "Setting up PostgreSQL for SQL Game..." -ForegroundColor Green

# Check if PostgreSQL is installed
$pgPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgPath) {
    Write-Host "PostgreSQL is not installed or not in PATH. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Create .env file with database configuration
Write-Host "Creating .env file with database configuration..." -ForegroundColor Blue
$envContent = @"
# Database Configuration
POSTGRES_URL=postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}
SQLITE_URL=sqlite:///./sql_game.db
TESTING=False
SEED_DB=True

# JWT Authentication
SECRET_KEY=yoursecretkey  # Change this in production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@

Set-Content -Path ".\backend\.env" -Value $envContent

Write-Host ".env file created successfully." -ForegroundColor Green

# Create the database if it doesn't exist
Write-Host "Creating database if it doesn't exist..." -ForegroundColor Blue
$checkDbQuery = "SELECT 1 FROM pg_database WHERE datname='${PG_DATABASE}'"
$dbExists = & psql -U $PG_USER -h $PG_HOST -p $PG_PORT -t -c $checkDbQuery postgres

if (-not $dbExists) {
    Write-Host "Creating database: ${PG_DATABASE}" -ForegroundColor Yellow
    & psql -U $PG_USER -h $PG_HOST -p $PG_PORT -c "CREATE DATABASE ${PG_DATABASE}" postgres
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database created successfully." -ForegroundColor Green
    } else {
        Write-Host "Failed to create database. Please check your PostgreSQL installation and credentials." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Database already exists." -ForegroundColor Green
}

# Initialize the database tables
Write-Host "Initializing database tables..." -ForegroundColor Blue
Set-Location -Path ".\backend"
python -c "from app.database.init_db import init_and_seed_db; init_and_seed_db()"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database tables created and seeded successfully." -ForegroundColor Green
} else {
    Write-Host "Failed to create database tables. Please check the error messages above." -ForegroundColor Red
    exit 1
}

Write-Host "PostgreSQL setup completed successfully!" -ForegroundColor Green
Write-Host "You can now run the application with the PostgreSQL database." -ForegroundColor Green
