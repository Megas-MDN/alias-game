const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Protected route test
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;
