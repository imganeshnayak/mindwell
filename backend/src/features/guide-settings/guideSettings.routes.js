// backend/src/features/guide-settings/guideSettings.routes.js
const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { getSettings, updateSettings } = require('./guideSettings.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
