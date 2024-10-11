const express = require('express');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/createUser', userController.createUserController);
router.get("/getSpecificUser", authenticateToken, isAdmin, userController.getSpecificUserController);
router.get('/getAllUsers', authenticateToken, isAdmin, userController.getAllUsersController);
router.patch('/updateUserField', authenticateToken, isAdmin, userController.updateSpecificUserFieldController);
router.delete('/deleteUser', authenticateToken, isAdmin, userController.deleteUserController);

module.exports = router;