import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import caseRoutes from './routes/caseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json());

// Health Check Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Mystery Room Backend',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Mystery Room Backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount Case API Routes
app.use('/api/cases', caseRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Initialize database and start HTTP server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[AI Mystery Room Server] Running on http://localhost:${PORT}`);
      console.log(`[AI Mystery Room Server] Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[Server Startup Failure]', error.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
