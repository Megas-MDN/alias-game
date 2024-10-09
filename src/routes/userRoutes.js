const express = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/createAdmin', authenticateToken, isAdmin, userController.createAdmin);
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

module.exports = router;