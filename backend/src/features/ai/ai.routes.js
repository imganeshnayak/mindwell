// backend/src/features/ai/ai.routes.js
const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { handleAIChat } = require('./ai.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/chat', handleAIChat);

module.exports = router;
