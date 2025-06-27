# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Initial Setup
```bash
npm run install:all    # Install dependencies for root, client, and server
cp .env.example .env.local  # Create local environment file
cd server && npx prisma db push  # Set up database schema
```

### Development
```bash
npm run dev            # Run both client and server in development mode
npm run dev:client     # Run React frontend only (Vite dev server on port 3000)
npm run dev:server     # Run Express backend only (port 8080)
```

### Database Operations
```bash
cd server && npx prisma db push      # Apply schema changes to database
cd server && npx prisma db pull      # Pull schema changes from database
cd server && npx prisma studio       # Open Prisma Studio for database management
cd server && npx prisma generate     # Regenerate Prisma client after schema changes
```

### Build
```bash
npm run build          # Build both client and server for production
npm run build:client   # Build React frontend (outputs to client/dist/)
npm run build:server   # No-op for Node.js (server runs directly)
```

### Testing
```bash
npm test               # Run tests for both client and server
npm run test:client    # Run frontend tests (currently none)
npm run test:server    # Run backend tests with Jest
```

## Architecture Overview

SnapValue is a monolithic full-stack application designed as a lead-generation tool for REALTOR® Anne Marie Velte. The application analyzes property photos using AI to generate home improvement recommendations.

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js + Express monolith serving both API and static frontend
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Multi-provider gateway with automatic failover (OpenAI, Gemini, Anthropic, OpenRouter)
- **Deployment**: Railway with containerized deployment

### Repository Structure
```
root/
├── client/                    # React frontend (Vite + Tailwind CSS)
│   ├── src/App.jsx           # Complete 4-step wizard implementation
│   ├── vite.config.js        # Vite config with proxy to backend port 8080
│   └── tailwind.config.js    # Custom Atria brand colors and fonts
├── server/                   # Express backend monolith
│   ├── index.js             # Main server entry point
│   ├── routes/lead.js       # Lead capture endpoint implementation
│   ├── services/            # Notification services (Email, Webhook, Multi)
│   ├── prisma/schema.prisma # Database schema (Lead, Report, Image models)
│   └── utils/logger.js      # Winston logging setup
├── .env.example             # Environment variables template
└── docs/                    # Design documentation
```

### Key Features Implemented
- **Frontend**: Complete 4-step wizard (upload → tag → details → review → report)
- **Lead Capture**: Modal with skip option for contact information
- **Notification System**: Multi-channel (email + webhook) with failover
- **Rate Limiting**: Configurable hourly/daily limits with header responses
- **Health Monitoring**: API health checks with frontend indicator

### API Endpoints Status
- ✅ `POST /api/lead` - Lead capture (fully implemented)
- 🚧 `POST /api/analyze` - Report generation (TODO)
- 🚧 `GET /api/report/:id/pdf` - PDF download (TODO)
- 🚧 `DELETE /api/privacy/delete/:leadId` - GDPR compliance (TODO)
- 🚧 `GET /healthz` - Health check (TODO)

### Environment Configuration
The application uses extensive environment variables for configuration:
- AI provider chain and API keys
- Rate limiting settings
- Database connection
- Email/webhook notification settings
- Storage and file upload limits
- Analytics and monitoring

### Development Patterns
- **Request ID Tracking**: All API calls include request ID logging for debugging
- **Error Handling**: User-friendly error messages with detailed logging
- **Event Tracking**: Google Analytics 4 integration for user flow monitoring
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Image Management**: File upload with preview, tagging, and replacement functionality

### Current Implementation Status
- **Frontend**: ✅ Complete production-ready React app (`client/src/App.js`)
- **Notifications**: ✅ All three notification services fully implemented (`/api/lead` endpoint complete)
- **Lead Capture**: ✅ Modal with skip option, no Calendly integration (removed as requested)
- **Backend Structure**: 🚧 Needs basic Express server setup
- **Database**: 🚧 Prisma schema ready, needs setup and migrations
- **AI Gateway**: 🚧 Multi-provider failover system needs implementation

### Immediate Next Steps
1. **Environment Setup**: Copy `.env.example` to `.env.local` and configure actual values
2. **Dependencies**: Run `npm install` in root directory
3. **Express Server**: Create basic server structure with request ID middleware
4. **Database**: Set up Prisma and run migrations
5. **Health Check**: Implement `/healthz` endpoint first
6. **Follow Implementation Guide**: See `docs/NEXT_STEPS.md` for detailed week-by-week plan

### Key Implementation Notes
- Frontend expects backend API but works independently for UI testing
- All notification channels (email/webhook) are production-ready
- Request ID tracking implemented for debugging
- Rate limiting headers expected by frontend
- Professional PDF generation with REALTOR® branding planned
- Cost monitoring with daily spend alerts configured