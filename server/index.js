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

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Portfolio HTML (root) ───────────────────────────────────────────────────
const portfolioHtml = path.join(__dirname, 'public', 'index.html');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(portfolioHtml);
});

// ── Admin Panel (React build) ───────────────────────────────────────────────
// Try two possible paths: local dev path and Vercel build path
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
    return res.status(503).send(`
      <html><body style="background:#080808;color:#f0ede6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:1rem;">
        <h2 style="color:#c8f065">Admin build not found</h2>
        <p>Run: <code style="background:#141414;padding:.3rem .6rem;border-radius:4px">cd client && npm run build</code> then push to GitHub</p>
      </body></html>
    `);
  }
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

app.get('/admin/*', (req, res) => {
  if (!adminBuildPath) return res.redirect('/admin');
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

// ── MongoDB Connection (cached for serverless) ──────────────────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅  MongoDB connected');
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌  DB error:', err.message);
    res.status(500).json({ message: 'Database connection failed.' });
  }
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

