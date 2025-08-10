const fetch = require('node-fetch');

class RecaptchaService {
    constructor() {
        this.secretKey = process.env.RECAPTCHA_SECRET_KEY;
        this.verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    }

    // Verify reCAPTCHA token with Google
    async verifyToken(token, remoteip = null) {
        try {
            if (!this.secretKey) {
                console.warn('reCAPTCHA Secret Key not configured, skipping verification');
                return { success: true, score: 0.9 }; // Allow in development
            }

            if (!token || token === 'test') {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Development mode: accepting test reCAPTCHA token');
                    return { success: true, score: 0.9 };
                }
                throw new Error('Invalid reCAPTCHA token');
            }

            const params = new URLSearchParams({
                secret: this.secretKey,
                response: token
            });

            if (remoteip) {
                params.append('remoteip', remoteip);
            }

            const response = await fetch(this.verifyUrl, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Failed to verify reCAPTCHA with Google');
            }

            console.log('reCAPTCHA verification result:', {
                success: data.success,
                score: data.score,
                action: data.action,
                hostname: data.hostname
            });
 
            return data;
        } catch (error) {
            console.error('reCAPTCHA verification error:', error.message);
            throw new Error(`reCAPTCHA verification failed: ${error.message}`);
        }
    }

    // Verify reCAPTCHA for OTP sending (requires score >= 0.5)
    async verifyForOTP(token, remoteip = null) {
        try {
            const result = await this.verifyToken(token, remoteip);
            
            if (!result.success) {
                throw new Error('reCAPTCHA verification failed');
            }

            // For reCAPTCHA v3, check score (0.0 = bot, 1.0 = human)
            if (result.score !== undefined && result.score < 0.5) {
                console.warn(`Low reCAPTCHA score: ${result.score}`);
                throw new Error('reCAPTCHA score too low, potential bot detected');
            }

            // Check action (should be 'send_otp')
            if (result.action && result.action !== 'send_otp') {
                console.warn(`Unexpected reCAPTCHA action: ${result.action}`);
            }

            return {
                success: true,
                score: result.score,
                action: result.action
            };
        } catch (error) {
            console.error('OTP reCAPTCHA verification failed:', error.message);
            throw error;
        }
    }
}

module.exports = new RecaptchaService();
