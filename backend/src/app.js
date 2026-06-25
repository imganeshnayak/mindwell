// backend/src/app.js
// Express application setup.
// Mounts all feature routers and global middleware.

const express = require('express');
const cors = require('cors');
const { errorMiddleware } = require('./middleware/error.middleware');

// Feature routers
const authRoutes = require('./features/auth/auth.routes');
const profileRoutes = require('./features/profile/profile.routes');
const guideSettingsRoutes = require('./features/guide-settings/guideSettings.routes');
const biometricsRoutes = require('./features/biometrics/biometrics.routes');
const nutritionRoutes = require('./features/nutrition/nutrition.routes');
const leaderboardRoutes = require('./features/leaderboard/leaderboard.routes');
const chatRoutes = require('./features/chat/chat.routes');
const aiRoutes = require('./features/ai/ai.routes');

const app = express();

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Feature Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/guide-settings', guideSettingsRoutes);
app.use('/api/biometrics', biometricsRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
