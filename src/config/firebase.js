const admin = require('firebase-admin');
const path = require('path');

// Import service account key
const serviceAccount = require(path.join(__dirname, '../../tukilab-d759b-firebase-adminsdk-fbsvc-154f638335.json'));

// Firebase Web API config
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: "tukilab-d759b.firebasestorage.app",
  messagingSenderId: "575516025074",
  appId: "1:575516025074:web:0ccb145b7eb3cf0929306b"
};
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: firebaseConfig.projectId
  });
}

const auth = admin.auth();

// Send OTP via Firebase Auth REST API
const sendOTP = async (phoneNumber, recaptchaToken = "test") => {
  try {
    // Format phone number for Vietnam (+84)
    const formattedPhone = phoneNumber.startsWith('0') 
      ? '+84' + phoneNumber.slice(1) 
      : phoneNumber;

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: formattedPhone,
        recaptchaToken: recaptchaToken || "test" // Use provided reCAPTCHA token
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Firebase SMS Error:', data);
      throw new Error(data.error?.message || 'Không thể gửi OTP qua Firebase');
    }

    return {
      sessionInfo: data.sessionInfo,
      success: true
    };
  } catch (error) {
    console.error('Send OTP Error:', error);
    throw new Error('Lỗi khi gửi OTP: ' + error.message);
  }
};

// Verify OTP code via Firebase Auth REST API
const verifyOTP = async (sessionInfo, code) => {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${firebaseConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionInfo: sessionInfo,
        code: code
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Firebase Verify Error:', data);
      throw new Error(data.error?.message || 'Mã OTP không chính xác');
    }

    return {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      uid: data.localId,
      phoneNumber: data.phoneNumber,
      success: true
    };
  } catch (error) {
    console.error('Verify OTP Error:', error);
    throw new Error('Lỗi khi xác thực OTP: ' + error.message);
  }
};

// Verify Firebase ID Token
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Token Firebase không hợp lệ');
  }
};

// Create custom token for user
const createCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await auth.createCustomToken(uid, additionalClaims);
    return customToken;
  } catch (error) {
    throw new Error('Không thể tạo custom token');
  }
};

module.exports = {
  auth,
  firebaseConfig,
  verifyFirebaseToken,
  createCustomToken,
  sendOTP,
  verifyOTP
};