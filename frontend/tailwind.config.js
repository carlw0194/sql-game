/**
 * Tailwind CSS Configuration
 * 
 * This configuration file defines the custom theme for the SQL Game project.
 * It includes custom colors, spacing, and other design tokens used throughout the application.
 * 
 * Custom colors:
 * - primary: Blue (#3B82F6) - Used for primary actions and key UI elements
 * - secondary: Green (#10B981) - Used for secondary actions and success states
 * - accent: Purple (#8B5CF6) - Used for highlighting and special elements
 * - background: Dark blue (#0F172A) - Main background color
 * - surface: Slate (#1E293B) - Card and component background color
 */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6', // Blue
        secondary: '#10B981', // Green
        accent: '#8B5CF6', // Purple
        background: '#0F172A', // Dark blue
        surface: '#1E293B', // Slate
      },
    },
  },
  plugins: [],
}
