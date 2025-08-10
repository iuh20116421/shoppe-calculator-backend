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
            return res.status(400).json({ msg: 'User already exists' });
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
                    message: 'User registered successfully',
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
            message: 'Server Error',
            error: err.message 
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
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
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
                    message: 'Login successful',
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
            message: 'Server Error',
            error: err.message 
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false,
            message: 'Server Error',
            error: err.message 
        });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
