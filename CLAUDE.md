# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Code Style Guidelines
- **TypeScript**: Use strict typing with proper interfaces in the types/ directory
- **Imports**: Group imports by: React/Next.js, third-party libraries, components, utilities
- **Components**: Use named exports and functional components with explicit type annotations
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **CSS**: Use Tailwind classes with the `cn()` utility for conditional class merging
- **Error Handling**: Use try/catch with async operations, return early for conditional logic
- **File Structure**: Group related functionality in dedicated directories
- **State Management**: Use React hooks for local state, server actions for data mutations

## Architecture
- Next.js App Router with server components
- Supabase for database and storage
- Tailwind CSS for styling
- Radix UI component primitives