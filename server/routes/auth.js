const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    if (username !== adminUsername) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const rawPassword = "nida1984!";
    const isMatch = password === rawPassword;

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { username: adminUsername, role: "admin" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "8h" },
    );

    res.json({
      message: "Login successful",
      token,
      user: { username: adminUsername, role: "admin" },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

router.post("/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ valid: false });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    );
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(403).json({ valid: false });
  }
});

module.exports = router;
