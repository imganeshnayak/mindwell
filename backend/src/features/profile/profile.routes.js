// backend/src/features/profile/profile.routes.js
// Profile feature routes — mounted at /api/profile
// All routes require authentication.

const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { getProfile, updateProfile } = require('./profile.controller');

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(authMiddleware);

// GET /api/profile
router.get('/', getProfile);

// PATCH /api/profile
router.patch('/', updateProfile);

module.exports = router;
