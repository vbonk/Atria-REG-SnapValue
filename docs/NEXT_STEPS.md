# Next Steps for Implementation

## 1. Create Express Server Structure

Create `server/index.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL, process.env.FRONTEND_URL_STAGING]
}));
app.use(express.json());

// Request ID middleware
app.use((req, res, next) => {
  req.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Routes
app.use(require('./routes/health'));
app.use(require('./routes/analyze'));
app.use(require('./routes/lead')); // Already implemented!
app.use(require('./routes/report'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 2. Implement Database Schema

Create `server/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lead {
  id               String   @id @default(uuid())
  email            String
  phone            String
  contactRequested Boolean  @default(false)
  reportId         String   @unique
  report           Report   @relation(fields: [reportId], references: [id])
  capturedAt       DateTime @default(now())
  createdAt        DateTime @default(now())
}

model Report {
  id            String   @id @default(uuid())
  city          String
  state         String
  timeline      String
  budget        String
  workPreference String
  reportData    Json
  aiCost        Float    @default(0)
  lead          Lead?
  images        Image[]
  createdAt     DateTime @default(now())
}

model Image {
  id        String   @id @default(uuid())
  reportId  String
  report    Report   @relation(fields: [reportId], references: [id])
  filename  String
  tag       String
  path      String
  createdAt DateTime @default(now())
}
```

## 3. Implement AI Gateway

Key requirements:
- Use PROVIDER_CHAIN environment variable
- Automatic failover on error
- Cost tracking per request
- Enforce MAX_COST_USD_PER_REPORT

## 4. Implement Remaining Routes

### /api/analyze
- Use multer for multipart form data
- Validate images (MIME type, magic bytes)
- Call AI Gateway
- Store in database
- Return reportId

### /api/report/:id/pdf
- Use Puppeteer to generate PDF
- Include REALTOR® branding
- Stream response

### /healthz
- Check database connectivity
- Return uptime and status

## 5. Add Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const analyzeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.REPORTS_PER_HOUR,
  handler: (req, res) => {
    res.status(429).json({ 
      error: 'Rate limit exceeded',
      requestId: req.id 
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

## 6. Testing Strategy

1. **Unit Tests**
   - AI Gateway with mocked providers
   - Cost calculation logic
   - Rate limiting logic

2. **Integration Tests**
   - Test each endpoint
   - Test notification delivery
   - Test provider failover

3. **E2E Tests**
   - Update existing Cypress tests
   - Remove Calendly references
   - Test lead capture flow

## 7. Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Build Docker image
4. Deploy to Railway
5. Configure domain and SSL
6. Set up monitoring

## Order of Implementation

1. **Week 1**: Express server, database, health endpoint
2. **Week 2**: AI Gateway, analyze endpoint
3. **Week 3**: PDF generation, storage service
4. **Week 4**: Rate limiting, cost tracking, cleanup job
5. **Week 5**: Testing, deployment, monitoring

The notification system (EmailNotifier, WebhookNotifier, MultiNotifier) and lead endpoint are already fully implemented and ready to use!