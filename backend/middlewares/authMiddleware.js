const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const pool = require('../config/db');
            const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Not authorized, user no longer exists' });
            }
            
            req.user = decoded;
            next();
        } catch (error) {
            console.error('JWT Error:', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const optionalAuth = async (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
        try {
            token = token.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const pool = require('../config/db');
            const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
            if (users.length > 0) {
                req.user = decoded;
            }
        } catch (error) {
            // Ignore token verification errors for optional auth
        }
    }
    next();
};

module.exports = { protect, optionalAuth };
