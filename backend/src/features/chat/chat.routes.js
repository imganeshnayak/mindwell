// backend/src/features/chat/chat.routes.js
const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { getChatHistory, saveMessage } = require('./chat.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/history', getChatHistory);
router.post('/message', saveMessage);

module.exports = router;
