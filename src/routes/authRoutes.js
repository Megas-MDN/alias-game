const { Router } = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

const router = Router();

// Create User Admin
router.post('/createAdmin', authenticateToken, authController.createAdminController);

// Login route
router.post('/login', authenticateToken, authController.loginUserController);

// Protected route test 
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

//Admin route test
router.get('/admin', authenticateToken, isAdmin, (req, res) => {
  res.json({ message: 'This is an admin route', user: req.user });
});

module.exports = router;
