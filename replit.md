# replit.md

## Overview

MindEase is a comprehensive mental health and wellness application designed specifically for college students. It combines mood tracking, AI-powered emotional analysis, conversational chat support, and academic stress management in a modern full-stack web application. The platform helps students monitor their mental well-being through daily check-ins, provides personalized insights through AI analysis, and offers crisis intervention support when needed.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query (React Query)** for server state management and data fetching
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for styling with CSS custom properties for theming
- **Chart.js** for data visualization (mood trends and analytics)

### Backend Architecture
- **Express.js** server with TypeScript
- **In-memory storage** implementation with a well-defined interface for future database migration
- **OpenAI API integration** for emotion analysis and AI chat responses
- RESTful API design with comprehensive error handling
- **Session-based architecture** ready for user authentication

### Database Design
- **Drizzle ORM** configured for PostgreSQL with schema definitions
- **Five main entities**: Users, Check-ins, Chat Messages, Exams, and Alerts
- **Relational structure** with proper foreign key relationships
- **JSON fields** for storing complex AI analysis results
- **Migration system** ready for database schema changes

## Key Components

### Mental Health Tracking
- **Daily Check-ins**: Mood scoring (1-5 scale), stress levels (1-10 scale), and journal entries
- **Emotion Analysis**: AI-powered analysis of journal text using GPT-4o
- **Crisis Detection**: Keyword-based and AI-powered crisis intervention triggers
- **Emergency Modal**: Immediate access to crisis hotlines and counseling resources

### AI Integration
- **OpenAI GPT-4o** for emotion analysis and natural language processing
- **Crisis keyword detection** for immediate intervention triggers
- **Conversational AI chat** for mental health support and guidance
- **Emotional sentiment analysis** with confidence scoring

### User Interface
- **Responsive design** optimized for desktop and mobile devices
- **Accessible components** using Radix UI primitives
- **Dashboard overview** with key metrics and trends
- **Interactive mood charting** with Chart.js visualization
- **Dark/light mode support** through CSS custom properties

### Data Management
- **Real-time updates** using React Query for cache invalidation
- **Optimistic updates** for improved user experience
- **Error boundaries** and comprehensive error handling
- **Loading states** and skeleton components for better UX

## Data Flow

1. **User Check-in Process**:
   - User completes mood, stress, and journal entry
   - Data sent to backend API endpoint
   - AI analysis triggered for journal text
   - Crisis detection algorithms evaluate content
   - Results stored and emergency modal triggered if needed

2. **AI Analysis Pipeline**:
   - Journal text processed by OpenAI API
   - Emotion scores calculated (anxiety, stress, depression, determination)
   - Crisis indicators and highlighted phrases extracted
   - Recommendations generated based on analysis
   - Results stored as JSON in database

3. **Dashboard Updates**:
   - React Query fetches latest data on page load
   - Real-time updates through cache invalidation
   - Charts and metrics automatically refresh
   - Trends calculated from historical check-ins

4. **Chat System**:
   - Messages stored with user/bot identification
   - AI responses generated using OpenAI API
   - Context-aware conversations for mental health support
   - Real-time message updates through React Query

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework for Node.js
- **openai**: Official OpenAI API client
- **@tanstack/react-query**: Server state management
- **react**: UI library with hooks and modern patterns

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **chart.js**: Canvas-based charting library

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database schema management and migrations

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit environment integration

## Deployment Strategy

### Development Environment
- **Vite dev server** serves the frontend with HMR (Hot Module Replacement)
- **tsx** runs the Express server with TypeScript support
- **Concurrent development** setup allows frontend and backend development simultaneously
- **Environment variable management** for API keys and database URLs

### Production Build Process
1. **Frontend**: Vite builds optimized React application to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied during deployment
4. **Static assets**: Served through Express static middleware

### Database Configuration
- **PostgreSQL** as the target database (Drizzle configured for pg dialect)
- **Environment-based** database URL configuration
- **Migration system** ready for schema changes
- **Connection pooling** supported through Neon serverless driver

### Scalability Considerations
- **Stateless server design** ready for horizontal scaling
- **Database abstraction** through storage interface for easy provider switching
- **API rate limiting** ready for implementation
- **Caching strategies** implemented through React Query
- **Error monitoring** and logging infrastructure ready for integration

The application is designed with production readiness in mind, featuring comprehensive error handling, security considerations for mental health data, and a modular architecture that supports future enhancements and scaling requirements.