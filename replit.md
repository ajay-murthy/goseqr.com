# GDPR Compliance Analyzer

## Overview

This application is a full-stack GDPR compliance analyzer that helps organizations analyze documents for GDPR compliance issues. It features a React frontend with TypeScript and shadcn/ui components, an Express.js backend with TypeScript, and uses Drizzle ORM with PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with file upload support
- **File Processing**: Multer for handling multipart/form-data uploads
- **Document Processing**: Custom DocumentParser service for extracting text content
- **AI Analysis**: OpenAI integration for GDPR compliance analysis
- **Storage**: In-memory storage with interface for future database integration

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured but not yet connected)
- **Current Storage**: In-memory storage implementation as temporary solution
- **Schema**: Well-defined database schema for documents and analyses

## Key Components

### Frontend Components
1. **DocumentUpload**: Handles file upload with drag-and-drop support
2. **EntityForm**: Collects GDPR entity information (data subject, controller, processor)
3. **AnalysisResults**: Displays comprehensive GDPR compliance analysis results
4. **Sidebar**: Step-by-step progress indicator for the analysis workflow

### Backend Services
1. **DocumentParser**: Extracts text content from uploaded documents
2. **GDPRAnalyzer**: Uses OpenAI to analyze documents for GDPR compliance
3. **Storage**: Abstracted storage layer with in-memory implementation

### Database Schema
- **Documents**: Stores uploaded document metadata and content
- **Analyses**: Stores GDPR compliance analysis results with detailed findings

## Data Flow

1. **Document Upload**: User uploads document → Frontend sends to `/api/documents` → Backend processes and stores document → Returns document metadata
2. **Entity Information**: User provides GDPR entity details → Frontend validates using Zod schemas
3. **Analysis**: Frontend sends analysis request to `/api/documents/:id/analyze` → Backend uses OpenAI to analyze document → Returns structured compliance results
4. **Results Display**: Frontend displays analysis results with categorized issues, warnings, and recommendations

## External Dependencies

### AI Services
- **OpenAI API**: Advanced GDPR compliance analysis using GPT-4o
- **Fallback**: Rule-based analyzer for backup scenarios when API fails
- **Configuration**: OpenAI API key required in environment variables

### Database
- **Neon Database**: PostgreSQL serverless database configured
- **Connection**: Uses @neondatabase/serverless driver

### UI Libraries
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Configured for Neon PostgreSQL

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend assets

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI-powered compliance analysis
- `NODE_ENV`: Environment indicator

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
- July 04, 2025. Fixed file upload issue with FormData handling in apiRequest function
- July 07, 2025. Implemented free rule-based GDPR analyzer to avoid API costs and token limits
- July 07, 2025. Integrated DeepSeek AI for enhanced GDPR compliance analysis
- July 07, 2025. Switched back to OpenAI with automatic fallback to rule-based analyzer
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```