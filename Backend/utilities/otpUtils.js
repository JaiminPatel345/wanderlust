const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Get the redisStore instance from redis.js
const redisStore = require('../redis');
// Access the client from the store
const redisClient = redisStore.client;

// OTP expiration time in seconds (10 minutes)
const OTP_EXPIRY_TIME = 10 * 60;

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to Redis with expiration
const saveOTP = async (email, otp) => {
    try {
        console.log(`OTP for ${email} is ${otp}`);
        const key = `otp:${email}`;
        await redisClient.set(key, otp);
        await redisClient.expire(key, OTP_EXPIRY_TIME);
        return true;
    } catch (error) {
        console.error('Error saving OTP:', error);
        return false;
    }
};

// Verify OTP from Redis
const verifyOTP = async (email, otp) => {
    try {
        const key = `otp:${email}`;
        const storedOTP = await redisClient.get(key);
        
        if (!storedOTP) {
            return { valid: false, message: 'OTP expired or not found' };
        }
        
        if (storedOTP !== otp) {
            return { valid: false, message: 'Invalid OTP' };
        }
        
        // Delete OTP after successful verification
        await redisClient.del(key);
        return { valid: true, message: 'OTP verified successfully' };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { valid: false, message: 'Error verifying OTP' };
    }
};

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAIL_EMAIL,
        pass: process.env.NODEMAIL_PASS
    }
});

// Send OTP email
const sendOTPEmail = async (email, otp, name = '') => {
    try {
        const mailOptions = {
            from: process.env.NODEMAIL_EMAIL,
            to: email,
            subject: 'Wanderlust Email Verification',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #ef4444; margin: 0;">Wanderlust</h1>
                    <p style="color: #6b7280; font-size: 16px;">Your journey begins with verification</p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #111827; margin-top: 0;">Hello${name ? ' ' + name : ''}!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Thank you for registering with Wanderlust. To complete your registration, please use the following verification code:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; background-color: #e5e7eb; padding: 10px; border-radius: 5px; display: inline-block;">${otp}</div>
                    </div>
                    <p style="color: #4b5563; font-size: 14px;">This code will expire in 10 minutes for security reasons.</p>
                </div>
                <div style="color: #6b7280; font-size: 14px; text-align: center;">
                    <p>If you didn&apos;t request this code, you can safely ignore this email.</p>
                    <p>© ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
                </div>
            </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    saveOTP,
    verifyOTP,
    sendOTPEmail
}; 