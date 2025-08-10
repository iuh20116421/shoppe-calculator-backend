const express = require('express');
const {
    sendOTPForRegister,
    sendOTPForForgotPassword,
    verifyOTPForRegister,
    verifyOTPForForgotPassword
} = require('../controllers/otpController');

const router = express.Router();

// @route   POST /api/otp/send-register
// @desc    Send OTP for registration
// @access  Public
router.post('/send-register', sendOTPForRegister);

// @route   POST /api/otp/verify-register
// @desc    Verify OTP for registration
// @access  Public
router.post('/verify-register', verifyOTPForRegister);

// @route   POST /api/otp/send-forgot-password
// @desc    Send OTP for forgot password
// @access  Public
router.post('/send-forgot-password', sendOTPForForgotPassword);

// @route   POST /api/otp/verify-forgot-password
// @desc    Verify OTP for forgot password
// @access  Public
router.post('/verify-forgot-password', verifyOTPForForgotPassword);

module.exports = router;
