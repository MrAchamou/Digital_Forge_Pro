# EffectForge AI

## Overview

EffectForge AI is a revolutionary visual effects generation platform that transforms text descriptions into professional-grade JavaScript effect code. The system uses advanced AI processing to analyze natural language descriptions and automatically generate optimized, customizable visual effects for web platforms, React components, and video editing software.

The application features a modern full-stack architecture with real-time effect generation, comprehensive effect libraries, file upload processing, and live preview capabilities. It's designed to democratize visual effects creation by making complex programming accessible through simple text descriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a modern component-based architecture with shadcn/ui components for consistent design. The frontend uses Wouter for lightweight routing and TanStack Query for efficient server state management with real-time updates. The styling system combines Tailwind CSS with custom CSS variables for a cohesive "Digital Forge" theme featuring dark backgrounds and vibrant accent colors (cyan, plasma pink, electric blue, gold).

Key architectural decisions include:
- **Component Organization**: Modular UI components separated into reusable elements (buttons, cards, forms) and page-specific components
- **State Management**: React Query for server state with optimistic updates and background refetching for real-time status monitoring
- **Real-time Updates**: Polling-based approach for job status, system health, and queue monitoring with configurable intervals
- **Performance**: Lazy loading of effect previews and code syntax highlighting to optimize bundle size

### Backend Architecture
The server implements a sophisticated multi-module architecture designed for autonomous operation and high-performance effect generation. The core system uses an orchestrator pattern that coordinates specialized modules for different effect types.

**Core Engine Components**:
- **Orchestrator**: Central coordinator that analyzes descriptions and selects appropriate modules
- **AI Engine**: Local NLP processing using embedded models for concept extraction and parameter optimization
- **Module System**: Specialized generators for particles, physics, lighting, and morphing effects
- **Queue System**: Job processing with Bull.js for handling concurrent effect generation
- **Template Engine**: Code generation system with optimizable templates

**Decision Engine**: Uses rule-based AI to select optimal modules based on natural language analysis, considering factors like effect complexity, performance requirements, and platform targets.

**Code Generation Pipeline**: Multi-stage process including concept extraction, module selection, parameter optimization, and template-based code generation with platform-specific adaptations.

### Data Storage Solutions
The application uses a hybrid storage approach optimized for development and scalability:

**Primary Storage**: PostgreSQL database with Drizzle ORM for type-safe database operations and schema management. The schema includes tables for users, effects, jobs, uploads, and system metrics with proper relationships and indexing.

**In-Memory Storage**: Fallback MemStorage implementation for development and testing, providing the same interface as the database layer.

**File Storage**: Local filesystem storage for uploaded files with support for multiple formats (TXT, MD, JSON, CSV, DOCX, PDF) and automatic cleanup.

**Performance Considerations**: Database queries are optimized with proper indexing, pagination support, and connection pooling. The storage layer abstracts implementation details allowing for easy migration between storage backends.

### Authentication and Authorization
Currently implements a basic user system with username/password authentication stored in the database. The architecture supports session-based authentication and is designed to accommodate future enhancements like OAuth integration or role-based permissions.

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database with connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database operations with automatic migration support
- **Neon Database**: Serverless PostgreSQL provider for cloud deployment

### AI and Processing
- **Local AI Engine**: Embedded natural language processing without external API dependencies
- **TensorFlow.js**: Client-side machine learning capabilities for real-time analysis
- **Bull.js**: Redis-based job queue for processing management

### Frontend Libraries
- **React**: Component framework with TypeScript support
- **TanStack Query**: Server state management with caching and background updates
- **Wouter**: Lightweight routing solution
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling framework

### Development and Build Tools
- **Vite**: Development server and build tool with HMR support
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment optimizations and deployment support

### File Processing
- **Multer**: File upload handling with size limits and type validation
- **Node.js File System**: Native file operations for document processing
- **Multi-format Parsers**: Support for various document types with error handling

The system is designed to be largely self-contained with minimal external service dependencies, ensuring reliable operation and easier deployment across different environments.