const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Không có token xác thực. Vui lòng đăng nhập' 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token đã hết hạn. Vui lòng đăng nhập lại' 
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token không hợp lệ. Vui lòng đăng nhập lại' 
            });
        } else {
            return res.status(401).json({ 
                success: false,
                message: 'Xác thực thất bại. Vui lòng đăng nhập lại' 
            });
        }
    }
};

module.exports = authMiddleware;
