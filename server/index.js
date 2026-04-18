require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contacts");

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Static Files ────────────────────────────────────────────────────────────
// NOTE: On Vercel, express.static() is ignored — Vercel serves files from
// the /public directory at the project root automatically.
// For local dev, we serve them here.
app.use(express.static(path.join(__dirname, "public")));

// Portfolio root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Admin panel (React build)
const adminBuildPath = path.join(__dirname, "../client/build");
app.use("/admin", express.static(adminBuildPath));
app.get("/admin", (req, res) => {
  res.sendFile(path.join(adminBuildPath, "index.html"));
});
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(adminBuildPath, "index.html"));
});

// ── MongoDB Connection ──────────────────────────────────────────────────────
// Cached connection for serverless (Vercel reuses warm function instances)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio_db";
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
  console.log("✅  MongoDB connected");
}

// Connect before every request (safe — cached after first call)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    res.status(500).json({ message: "Database connection failed." });
  }
});

// ── Local Dev Server ────────────────────────────────────────────────────────
// On Vercel, module.exports = app is used instead of app.listen()
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`\n🚀  Server: http://localhost:${PORT}`);
        console.log(`🌐  Portfolio: http://localhost:${PORT}/`);
        console.log(`🔐  Admin: http://localhost:${PORT}/admin/login`);
        console.log(`📡  API: http://localhost:${PORT}/api/health\n`);
      });
    })
    .catch((err) => {
      console.error("\n❌  MongoDB connection failed:", err.message);
      console.error("    macOS:   brew services start mongodb-community");
      console.error("    Linux:   sudo systemctl start mongod");
      console.error("    Windows: net start MongoDB\n");
      process.exit(1);
    });
}

// ── Export for Vercel ───────────────────────────────────────────────────────
module.exports = app;
