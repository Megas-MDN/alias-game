const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
       return res.status(401).json({ message: 'Authorization header missing.' });
    }

    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) return res.status(401).json({ message: 'Access token missing' });
  
    try {
      const user = verifyToken(token); 
      req.user = user; 
      next(); 
    } catch (error) {
      res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = {authenticateToken};
