# MyPetID - Smart Pet Identification System

## Overview

MyPetID is a comprehensive smart pet identification system that combines NFC-enabled tags with digital profiles to help keep pets safe and provide crucial information to anyone who finds them. The system allows pet owners to create detailed profiles accessible via NFC tags or QR codes, enabling quick identification and contact with owners when pets are lost.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite
- **Styling**: Tailwind CSS with Shadcn/UI components
- **State Management**: TanStack Query for server state, localStorage for auth
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/UI with custom components
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Data Provider**: In-memory storage for development, PostgreSQL for production
- **Authentication**: JWT-based session authentication
- **API Design**: RESTful endpoints with proper HTTP methods
- **File Storage**: Base64 encoding for images and documents

### Deployment Architecture
- **Development**: Vite dev server with Express API
- **Production**: Can be adapted for GitHub Pages with workflows
- **Database**: PostgreSQL via Neon Database
- **Session Storage**: Server-side sessions with token-based auth
- **Admin System**: Special admin login mode for CAK3D user account

## Key Components

### Database Schema
- **Users Table**: Stores user accounts with authentication and profile data
- **Dogs Table**: Pet profiles with comprehensive information including medical records, personality traits, and media
- **Locations Table**: GPS tracking data for pets with device information
- **Sessions Table**: User authentication sessions with expiration handling

### Authentication System
- Email/password authentication with secure password hashing
- Session-based authentication with Bearer token system
- Patreon integration for premium features verification (https://patreon.com/MyPetID)
- Role-based access control for different user tiers
- Admin system with special login mode for CAK3D user (real_cak3d@yahoo.com)
- Email verification system with 6-digit codes
- Token-based verification with 30-minute expiration
- Patreon tier verification: Supporter ($5), Guardian ($10), Protector ($20)

### Pet Management
- NFC tag integration for quick profile access
- Comprehensive pet profiles with photo galleries, medical info, and personality data
- Device-based file uploads for photos (phone, tablet, PC support)
- Medical document uploads with privacy warnings (PDF, DOC, images)
- Base64 file storage for images and documents
- Social media links integration for pets and owners
- Donation link support for pet care and emergency funding
- Location tracking with multiple device support
- Emergency contact information with detailed owner data
- Report lost/found functionality with status tracking
- Last seen timestamp tracking and location display
- Photo preview and management system

### Third-Party Integrations
- **Patreon API**: For premium user verification and tier management
- **NFC Technology**: For physical tag integration
- **GPS Tracking**: For location-based services

## Data Flow

### Pet Profile Access
1. User scans NFC tag or QR code
2. System retrieves pet profile by NFC tag ID
3. Profile data displayed with owner contact information
4. Location data fetched if available

### User Registration
1. User submits registration form
2. User data stored with unverified email status
3. GitHub workflow triggered to send verification email
4. User sees verification form with 6-digit code input
5. User can log in but sees unverified status until email is verified
6. Email verification completes account setup

### Pet Management
1. Authenticated user accesses dashboard
2. Pet creation/editing through form interface
3. Data validated and stored in database
4. NFC tag association managed

### Location Tracking
1. Mobile device reports GPS coordinates
2. Location data stored with device and timestamp information
3. Real-time location updates available to owners
4. Historical location data maintained

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe database ORM
- **express**: Web server framework
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **crypto**: Password hashing and token generation

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Utility-first CSS framework
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development Environment
- Vite development server with hot module replacement
- Express API server running concurrently
- PostgreSQL database with development credentials
- Environment variable configuration for API keys

### Production Deployment
1. Frontend built with Vite to static assets
2. Backend bundled with esbuild for Node.js deployment
3. Database migrations run via Drizzle Kit
4. Environment variables configured for production database and API keys
5. Static assets served by Express with API routes

### Database Management
- Schema defined in TypeScript with Drizzle ORM
- Migrations generated and applied automatically
- Connection pooling handled by Neon Database
- Session cleanup and maintenance automated

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Converted to static frontend application with GitHub workflows backend  
- July 07, 2025. Preserved existing JSON file system with optional MongoDB sync via push-to-mongo.js script
- July 08, 2025. Added file upload functionality for pet photos and medical documents with privacy warnings
- July 08, 2025. Integrated Tasker NFC location tracking with GitHub workflows and Google Maps display
- July 08, 2025. Created location update workflow for automatic GPS tracking via NFC tag scans
- July 08, 2025. Implemented email verification system with 6-digit token verification and GitHub workflows integration
- July 08, 2025. Enhanced pet profiles with photo galleries, social links, donation support, and complete profile sections
- July 08, 2025. Added report lost functionality, status tracking, last seen timestamps, and enhanced contact sections
- July 08, 2025. Implemented device-based file uploads for pet photos and medical documents with base64 storage
- July 08, 2025. Added Patreon verification system with tier-based access control
- July 08, 2025. Created admin system for CAK3D user with dual login modes (user/admin)
- July 08, 2025. Enhanced authentication with Bearer token system and proper API request handling
- July 08, 2025. **MAJOR UPDATE**: Integrated MongoDB as primary database with comprehensive GitHub workflows system
- July 08, 2025. Created bidirectional data sync between JSON files and MongoDB with automatic workflows
- July 08, 2025. Implemented issue-based API system for user registration, pet management, and location tracking
- July 08, 2025. Added complete email verification system with SMTP integration and database storage
- July 08, 2025. Enhanced data persistence with MongoDB collections for all system components
- July 08, 2025. Created comprehensive deployment documentation for GitHub Pages with MongoDB integration