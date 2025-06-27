const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.FRONTEND_URL_STAGING || 'http://localhost:3000',
    'http://localhost:3000' // Always allow local development
  ],
  credentials: true
}));

app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ extended: true, limit: '80mb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path} [${req.id}]`);
  next();
});

// Health check endpoint
app.get('/healthz', async (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.id,
    database: false
  };

  // Check database connectivity if DATABASE_URL is provided
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = require('./db');
      await prisma.$queryRaw`SELECT 1`;
      health.database = true;
    } catch (error) {
      console.error('Database health check failed:', error.message);
      health.database = false;
      health.status = 'degraded';
    }
  } else {
    console.warn('DATABASE_URL not provided - database health check skipped');
  }

  res.status(200).json(health);
});

// Routes
try {
  app.use(require('./routes/lead'));
  console.log('Lead routes loaded successfully');
} catch (error) {
  console.error('Failed to load lead routes:', error.message);
}

try {
  app.use(require('./routes/analyze'));
  console.log('Analyze routes loaded successfully');
} catch (error) {
  console.error('Failed to load analyze routes:', error.message);
}

// Serve static files from client build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error [${req.id}]:`, err);
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    requestId: req.id
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 SnapValue server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});