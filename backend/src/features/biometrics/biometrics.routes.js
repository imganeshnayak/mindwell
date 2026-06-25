const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// Placeholder endpoints for biometrics proxy if needed later
router.get('/', (req, res) => {
  res.json({ message: 'Biometrics endpoint', userId: req.user.id });
});

module.exports = router;
