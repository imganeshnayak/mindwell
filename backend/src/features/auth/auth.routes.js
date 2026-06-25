// backend/src/features/auth/auth.routes.js
// Auth feature routes — mounted at /api/auth

const express = require('express');
const { register, login } = require('./auth.controller');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;
