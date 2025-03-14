# SQL Game Database Documentation

This document provides a comprehensive overview of the database structure used in the SQL Game project. The application uses a dual-database approach:

1. **Main PostgreSQL Database**: Stores user data, progress, achievements, and leaderboards
2. **SQLite Challenge Database**: Stores SQL challenges and their schemas

## Database Configuration

The database connection is configured in `backend/app/database/session.py`. The application uses environment variables to determine connection parameters:

```python
# PostgreSQL connection string
POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:password@localhost/sql_game")

# SQLite connection string (for challenges)
SQLITE_URL = os.getenv("SQLITE_URL", "sqlite:///./sql_game.db")
```

## Database Schema

### Main PostgreSQL Database

#### User Model (`app/models/user.py`)

Stores user account information and authentication details.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| email | String | User's email address (unique) |
| username | String | User's username (unique) |
| hashed_password | String | Bcrypt hashed password |
| full_name | String | User's full name |
| role | Enum | User role (USER, ADMIN) |
| avatar_type | Enum | Avatar type (SYSTEM, CUSTOM) |
| avatar_url | String | URL to user's avatar image |
| is_active | Boolean | Whether the user account is active |
| created_at | DateTime | When the user account was created |

#### Challenge Model (`app/models/challenge.py`)

Defines SQL challenges that users can solve.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| title | String | Challenge title |
| description | String | Challenge description |
| difficulty | Enum | Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED) |
| type | Enum | Challenge type (SELECT, JOIN, AGGREGATE, etc.) |
| points | Integer | Points awarded for completion |
| initial_sql | String | Initial SQL code provided to the user |
| expected_result | String | Expected result of the SQL query |
| solution | String | Solution SQL query |
| hint | String | Hint for solving the challenge |
| schema_sql | String | SQL to create the schema for this challenge |

#### UserProgress Model (`app/models/challenge.py`)

Tracks user progress on challenges.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to User |
| challenge_id | Integer | Foreign key to Challenge |
| completed | Boolean | Whether the challenge is completed |
| attempts | Integer | Number of attempts made |
| last_attempt_at | DateTime | When the last attempt was made |
| completed_at | DateTime | When the challenge was completed |
| solution_sql | String | User's solution SQL |
| execution_time_ms | Integer | Execution time in milliseconds |

#### Achievement Model (`app/models/progress.py`)

Defines achievements that users can earn.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String | Achievement name |
| description | String | Achievement description |
| category_id | Integer | Foreign key to AchievementCategory |
| points | Integer | Points awarded for earning this achievement |
| icon | String | Icon for the achievement |

#### UserAchievement Model (`app/models/progress.py`)

Tracks which achievements users have earned.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to User |
| achievement_id | Integer | Foreign key to Achievement |
| earned_at | DateTime | When the achievement was earned |

#### AchievementCategory Model (`app/models/progress.py`)

Categorizes achievements.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String | Category name |
| description | String | Category description |

#### SkillTree Model (`app/models/progress.py`)

Defines skill trees for user progression.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String | Skill tree name |
| description | String | Skill tree description |
| level | Integer | Skill tree level |
| icon | String | Icon for the skill tree |
| prerequisites | String | Prerequisites for unlocking this skill tree |

#### UserSkill Model (`app/models/progress.py`)

Tracks which skills users have unlocked.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to User |
| skill_id | Integer | Foreign key to SkillTree |
| unlocked_at | DateTime | When the skill was unlocked |
| level | Integer | Current level in this skill |

#### LeaderboardEntry Model (`app/models/leaderboard.py`)

Stores leaderboard entries.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to User |
| type | Enum | Leaderboard type (WEEKLY, MONTHLY, ALL_TIME) |
| score | Integer | User's score |
| rank | Integer | User's rank |
| updated_at | DateTime | When the entry was last updated |

## Database Initialization and Seeding

The database is initialized in `backend/app/database/init_db.py`. This script:

1. Creates all tables in both the PostgreSQL and SQLite databases
2. Optionally seeds the database with initial data when the `SEED_DB` environment variable is set to `True`

The seeding process in `backend/app/database/seed_db.py` creates:

1. Sample users (admin and regular user)
2. SQL challenges of varying difficulty
3. Achievements and achievement categories
4. Skill trees for user progression

## Setting Up PostgreSQL

To set up the PostgreSQL database:

1. Install PostgreSQL on your system
2. Run the `setup_postgres.ps1` script to:
   - Create the PostgreSQL database
   - Set up environment variables
   - Initialize and seed the database

```powershell
.\setup_postgres.ps1
```

## Database Migrations

The project currently does not use a migration system. When the schema changes, the database needs to be recreated.

Future improvements could include:
- Implementing Alembic for database migrations
- Adding backup and restore functionality
- Implementing database versioning

## Challenge Database Structure

The SQLite challenge database is separate from the main PostgreSQL database and contains:

1. Tables defined in each challenge's `schema_sql`
2. Data inserted by the challenge setup code

Each challenge operates in its own isolated environment to prevent conflicts between challenges.

## Database Security

- User passwords are hashed using bcrypt
- Database credentials are stored in environment variables
- PostgreSQL connection uses TLS encryption
- Input validation is performed on all user inputs
- Parameterized queries are used to prevent SQL injection

## Backup and Recovery

Currently, the project does not have automated backup and recovery procedures. It is recommended to:

1. Set up regular PostgreSQL backups using `pg_dump`
2. Store backups securely in an off-site location
3. Test restoration procedures regularly
