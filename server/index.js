require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ── MongoDB Connection (cached for serverless) ──────────────────────────────
// IMPORTANT: This must be defined and used BEFORE route handlers
let cachedConnection = null;

async function connectDB() {
  // If already connected and connection is ready, reuse it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';

  // Disconnect if in a broken state before reconnecting
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  cachedConnection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,  // 10s to find a server
    socketTimeoutMS: 45000,           // 45s for operations
    connectTimeoutMS: 10000,          // 10s to establish connection
    maxPoolSize: 10,                  // max connections in pool
    bufferCommands: false,            // CRITICAL: don't buffer if not connected
  });

  console.log('✅  MongoDB connected');
  return cachedConnection;
}

// ── DB Connection Middleware — runs BEFORE every route ──────────────────────
app.use(async (req, res, next) => {
  // Skip DB connection for static files
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌  DB connection error:', err.message);
    res.status(500).json({ message: 'Database connection failed. Please try again.' });
  }
});

// ── API Routes (after DB middleware) ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.get('/api/health', async (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: dbState[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// ── Portfolio HTML (root) ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Admin Panel (React build) ───────────────────────────────────────────────
const adminBuildPaths = [
  path.join(__dirname, '../client/build'),
  path.join(process.cwd(), 'client/build'),
];
let adminBuildPath = adminBuildPaths.find(p => fs.existsSync(path.join(p, 'index.html')));
if (adminBuildPath) {
  app.use('/admin', express.static(adminBuildPath));
}
app.get('/admin', (req, res) => {
  if (!adminBuildPath) {
    return res.status(503).send(`<html><body style="background:#080808;color:#f0ede6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:1rem;"><h2 style="color:#c8f065">Admin build not found</h2><p>Run: <code>cd client && npm run build</code> then push to GitHub</p></body></html>`);
  }
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});
app.get('/admin/*', (req, res) => {
  if (!adminBuildPath) return res.redirect('/admin');
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// ── Local Dev ───────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`\n🚀  http://localhost:${PORT}`);
        console.log(`🌐  Portfolio : http://localhost:${PORT}/`);
        console.log(`🔐  Admin     : http://localhost:${PORT}/admin/login`);
        console.log(`📡  API       : http://localhost:${PORT}/api/health\n`);
      });
    })
    .catch(err => {
      console.error('❌  MongoDB failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;

