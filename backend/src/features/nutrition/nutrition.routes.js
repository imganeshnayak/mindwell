const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({ message: 'Nutrition endpoint', userId: req.user.id });
});

module.exports = router;
