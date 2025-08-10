const User = require('../models/userModel');
const { sendOTP, verifyOTP } = require('../config/firebase');
const recaptchaService = require('../services/recaptchaService');

// Temporary session storage (trong production nên dùng Redis)
const sessionStorage = new Map();

// Send OTP for registration
const sendOTPForRegister = async (req, res) => {
    const { phone, recaptchaToken } = req.body;
    console.log("recaptchaToken", recaptchaToken);
    try { 
        // Verify reCAPTCHA token first
        await recaptchaService.verifyForOTP(recaptchaToken, req.ip);
        
        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng số điện thoại khác'
            });
        }

        // Send OTP via Firebase with reCAPTCHA
        const result = await sendOTP(phone, recaptchaToken);
        
        // Store session info (expire in 5 minutes)
        sessionStorage.set(`register_${phone}`, {
            sessionInfo: result.sessionInfo,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0
        });

        res.json({
            success: true,
            message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
            sessionInfo: result.sessionInfo, // FE cần lưu để verify
            expiresIn: 300 // 5 minutes
        });
    } catch (error) {
        console.error('Send OTP Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể gửi mã OTP. Vui lòng thử lại'
        });
    }
};

// Send OTP for forgot password
const sendOTPForForgotPassword = async (req, res) => {
    const { phone, recaptchaToken } = req.body;

    try {
        // Verify reCAPTCHA token first
        await recaptchaService.verifyForOTP(recaptchaToken, req.ip);
        
        // Check if user exists
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại không tồn tại trong hệ thống'
            });
        }

        // Send OTP via Firebase with reCAPTCHA
        const result = await sendOTP(phone, recaptchaToken);
        
        // Store session info (expire in 5 minutes)
        sessionStorage.set(`forgot_${phone}`, {
            sessionInfo: result.sessionInfo,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempts: 0,
            userId: user._id
        });

        res.json({
            success: true,
            message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
            sessionInfo: result.sessionInfo, // FE cần lưu để verify
            expiresIn: 300 // 5 minutes
        });
    } catch (error) {
        console.error('Send OTP Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Không thể gửi mã OTP. Vui lòng thử lại'
        });
    }
};

// Verify OTP for registration
const verifyOTPForRegister = async (req, res) => {
    const { phone, sessionInfo, otp } = req.body;

    try {
        const key = `register_${phone}`;
        const storedSession = sessionStorage.get(key);

        if (!storedSession) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy phiên OTP. Vui lòng yêu cầu mã mới'
            });
        }

        if (Date.now() > storedSession.expiresAt) {
            sessionStorage.delete(key);
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới'
            });
        }

        if (storedSession.attempts >= 3) {
            sessionStorage.delete(key);
            return res.status(400).json({
                success: false,
                message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới'
            });
        }

        // Verify with Firebase
        const result = await verifyOTP(sessionInfo, otp);

        if (!result.success) {
            storedSession.attempts++;
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không chính xác'
            });
        }

        // OTP correct, remove from storage
        sessionStorage.delete(key);

        res.json({
            success: true,
            message: 'Xác thực OTP thành công. Bạn có thể tiếp tục đăng ký',
            isVerified: true,
            phoneNumber: result.phoneNumber
        });
    } catch (error) {
        console.error('Verify OTP Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Mã OTP không chính xác'
        });
    }
};

// Verify OTP for forgot password
const verifyOTPForForgotPassword = async (req, res) => {
    const { phone, sessionInfo, otp } = req.body;

    try {
        const key = `forgot_${phone}`;
        const storedSession = sessionStorage.get(key);

        if (!storedSession) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy phiên OTP. Vui lòng yêu cầu mã mới'
            });
        }

        if (Date.now() > storedSession.expiresAt) {
            sessionStorage.delete(key);
            return res.status(400).json({
                success: false,
                message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới'
            });
        }

        if (storedSession.attempts >= 3) {
            sessionStorage.delete(key);
            return res.status(400).json({
                success: false,
                message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới'
            });
        }

        // Verify with Firebase
        const result = await verifyOTP(sessionInfo, otp);

        if (!result.success) {
            storedSession.attempts++;
            return res.status(400).json({
                success: false,
                message: 'Mã OTP không chính xác'
            });
        }

        // OTP correct, remove from storage
        sessionStorage.delete(key);

        // Create reset token
        const resetToken = Buffer.from(`${storedSession.userId}:${Date.now()}`).toString('base64');

        res.json({
            success: true,
            message: 'Xác thực OTP thành công. Bạn có thể đặt lại mật khẩu',
            resetToken,
            userId: storedSession.userId,
            phoneNumber: result.phoneNumber
        });
    } catch (error) {
        console.error('Verify OTP Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Mã OTP không chính xác'
        });
    }
};

module.exports = {
    sendOTPForRegister,
    sendOTPForForgotPassword,
    verifyOTPForRegister,
    verifyOTPForForgotPassword
};