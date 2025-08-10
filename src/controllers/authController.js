const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
const registerUser = async (req, res) => {
    const { name, phone, password, shopLink } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác' 
            });
        }

        // Create new user
        user = new User({
            name,
            phone,
            password,
            shopLink: shopLink || '',
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
            },
        };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }, 
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ 
                    success: true,
                    message: 'Đăng ký tài khoản thành công',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        phone: user.phone,
                        shopLink: user.shopLink,
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        
        // Handle duplicate key error (MongoDB)
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Lỗi hệ thống. Vui lòng thử lại sau',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Số điện thoại không tồn tại trong hệ thống' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Mật khẩu không chính xác' 
            });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
            },
        };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    success: true,
                    message: 'Đăng nhập thành công',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        phone: user.phone,
                        shopLink: user.shopLink,
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi hệ thống. Vui lòng thử lại sau',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng'
            });
        }

        res.json({
            success: true,
            message: 'Lấy thông tin người dùng thành công',
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi hệ thống. Vui lòng thử lại sau',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };