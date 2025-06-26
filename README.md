# SnapValue - AI-Powered Home Value Enhancement Tool

## Overview
SnapValue is a lead-generation tool for REALTOR® Anne Marie Velte that analyzes property photos and generates personalized home improvement recommendations to maximize selling price.

## Current Status
- ✅ **Frontend**: Complete React app with 4-step wizard (see `client/src/App.js`)
- ✅ **Notification System**: Email + Webhook notifiers implemented
- ✅ **Lead Endpoint**: `/api/lead` fully implemented
- 🚧 **Backend**: Other endpoints need implementation
- 🚧 **Database**: Schema designed, needs setup
- 🚧 **Deployment**: Ready for Railway

## Quick Start

```bash
# Clone the repository
git clone https://github.com/vbonk/Atria-REG-SnapValue.git
cd Atria-REG-SnapValue

# Install dependencies
cd client && npm install
cd ../server && npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development servers
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Prisma
- **Database**: PostgreSQL
- **AI**: Multi-provider gateway (OpenAI, Gemini, Anthropic, OpenRouter)
- **Storage**: Local filesystem / S3 compatible
- **Notifications**: Email (SMTP) + Webhooks

## Key Features
1. **Image Analysis**: Upload property photos for AI analysis
2. **Smart Recommendations**: Get actionable improvement suggestions
3. **Lead Capture**: Optional contact form with skip option
4. **PDF Reports**: Branded reports with REALTOR® information
5. **Multi-Channel Notifications**: Email and webhook support
6. **Rate Limiting**: Configurable limits per hour/day
7. **Cost Controls**: Maximum cost per report enforcement

## Environment Variables
See `.env.example` for all required variables. Key ones:
- `PROVIDER_CHAIN`: AI provider failover order
- `NOTIFIER_CHANNELS`: Enable email, webhook, or both
- `SMTP_USER/SMTP_PASS`: Google SMTP credentials
- `DATABASE_URL`: PostgreSQL connection string

## API Endpoints

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/healthz` | GET | 🚧 TODO | Health check |
| `/api/analyze` | POST | 🚧 TODO | Generate report from images |
| `/api/lead` | POST | ✅ DONE | Save lead information |
| `/api/report/:id/pdf` | GET | 🚧 TODO | Download PDF report |
| `/api/privacy/delete/:leadId` | DELETE | 🚧 TODO | GDPR compliance |

## Development Status

### Completed
- Frontend application (App.js)
- Lead capture modal with skip
- Email notification service
- Webhook notification service
- Multi-channel notifier
- Lead API endpoint
- Environment configuration

### TODO
- Express server setup
- AI Gateway implementation
- Database migrations
- PDF generation
- Image storage
- Rate limiting
- Cost tracking
- Other API endpoints
- Testing suite
- CI/CD pipeline

## Deployment
The application is designed for Railway deployment:
1. PostgreSQL database addon
2. Environment variables configuration
3. Custom domain setup
4. SSL certificate

## Testing
```bash
# Run tests (when implemented)
npm test

# Run E2E tests
cd client && npm run cypress
```

## Contributing
This is a production application for Atria Real Estate Group. Please ensure:
- All code follows the established patterns
- Tests pass before committing
- Environment variables are never committed
- Request IDs are propagated for debugging

## Support
For issues or questions about the implementation, refer to:
- `docs/DESIGN_WORK.md` - Original design decisions
- `docs/NEXT_STEPS.md` - Implementation guide
- `Build-the-SnapValue-Application.md` - Complete specifications

---

**Note**: This is a real business application. Prioritize reliability, operational excellence, and user experience.