# SQL Scenario Game

SQL Scenario is an educational game designed to teach advanced SQL concepts through interactive gameplay. Players can improve their database skills by solving real-world SQL challenges in various game modes.

## Project Overview

This project aims to create an engaging learning experience for SQL enthusiasts of all levels. The game features multiple modes, realistic database scenarios, and performance metrics to help players understand and master SQL concepts.

### Game Modes

- **Career Mode**: Progress through levels of increasing difficulty, unlocking new challenges and concepts
- **Sandbox Mode**: Practice SQL in an open environment with instant feedback and performance metrics
- **Multiplayer Mode** (Coming Soon): Compete with other players in SQL challenges

## Project Structure

The project is organized into frontend and backend components:

### Frontend (React + TypeScript + Vite)

```
frontend/
├── public/            # Static assets
├── src/
│   ├── assets/        # Images, fonts, and other assets
│   ├── components/    # Reusable UI components
│   │   ├── game/      # Game-specific components
│   │   ├── layout/    # Layout components
│   │   └── player/    # Player-related components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API and service functions
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── index.html         # HTML entry point
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

### Backend (Coming Soon)

The backend will be implemented to handle:
- User authentication and profiles
- Challenge evaluation
- Database simulation
- Multiplayer functionality

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/sql-scenario.git
   cd sql-scenario
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks
- Include educational comments to explain code functionality
- Use Tailwind CSS for styling

### Component Structure

- Create reusable components in the `components` directory
- Place page-level components in the `pages` directory
- Use custom hooks for shared logic

### Adding New Features

1. Create necessary type definitions in `src/types`
2. Implement UI components in `src/components`
3. Add page components in `src/pages`
4. Update routing in `App.tsx`
5. Add any required services in `src/services`

## Features

- **Interactive SQL Editor**: Write and execute SQL queries with syntax highlighting
- **Performance Metrics**: Get feedback on query execution time and optimization
- **Database Schema Visualization**: View table relationships and column details
- **Progressive Learning**: Start with basic concepts and advance to complex queries
- **Achievements and Badges**: Earn rewards for completing challenges and mastering concepts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors who have helped shape this educational tool
- Inspired by the need for interactive SQL learning resources
