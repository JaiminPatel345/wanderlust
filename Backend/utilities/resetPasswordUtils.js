const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Get the Redis client and token utilities from redis.js
const {client: redisClient, tokenUtils} = require('./redis');

// Reset token expiration time in seconds (1 hour)
const RESET_TOKEN_EXPIRY = 60 * 60;
const RESET_TOKEN_PREFIX = 'reset-password';

/**
 * Generate and encrypt a reset token with user ID
 * @param {string} email - The user ID to include in the token
 * @returns {string} - The encrypted reset token
 */
const generateResetToken = (email) => {
  // Generate a random token
  const randomToken = crypto.randomBytes(32).toString('hex');

  // Create a payload with user ID and random token
  const payload = {
    email,
    token: randomToken,
  };

  // Encrypt the payload with JWT using the reset password secret
  return {
    resetToken: jwt.sign(payload,
        process.env.RESET_PASSWORD_SECRET,
        {expiresIn: '1h'},
    ),
    token: randomToken,
  };
};

/**
 * Decrypt and validate a reset token
 * @param {string} encryptedToken - The encrypted token to validate
 * @returns {Object|null} - The decoded token payload or null if invalid
 */
const decryptResetToken = (encryptedToken) => {
  try {
    return jwt.verify(encryptedToken, process.env.RESET_PASSWORD_SECRET);
  } catch (error) {
    console.error('Error decrypting reset token:', error);
    return null;
  }
};

/**
 * Save reset token to Redis with expiration
 * @param {string} email - The user's ID
 * @param {string} token - The original random token (not encrypted)
 * @returns {Promise<boolean>} - True if saved successfully, false otherwise
 */
const saveResetToken = async (email, token) => {
  try {
    await tokenUtils.saveToken(RESET_TOKEN_PREFIX,
        email,
        token,
        RESET_TOKEN_EXPIRY,
    );
    return true;
  } catch (error) {
    console.error('Error saving reset token:', error);
    return false;
  }
};

/**
 * Verify reset token from Redis
 * @param {string} email - The user's ID
 * @param {string} token - The token to verify
 * @returns {Promise<boolean>} - True if token is valid, false otherwise
 */
const verifyResetToken = async (email, token) => {
  try {
    const storedToken = await tokenUtils.getToken(RESET_TOKEN_PREFIX, email);

    if (!storedToken) {
      return false; // Token expired or not found
    }

    if (storedToken !== token) {
      return false; // Invalid token
    }

    // Delete token after successful verification (one-time use)
    await tokenUtils.deleteToken(RESET_TOKEN_PREFIX, email);
    return true;
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return false;
  }
};

/**
 * Send reset password email with link
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} encryptedToken - The encrypted reset token
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendResetEmail = async (email, name, encryptedToken) => {
  try {
    // Make sure the reset link points to the frontend app at the correct path
    const resetLink = `${process.env.REACT_APP_API_URL}/reset-password?token=${encodeURIComponent(
        encryptedToken)}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAIL_EMAIL,
        pass: process.env.NODEMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAIL_EMAIL,
      to: email,
      subject: 'Reset Your Wanderlust Password',
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #ef4444; margin: 0;">Wanderlust</h1>
                    <p style="color: #6b7280; font-size: 16px;">Password Reset Request</p>
                </div>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #111827; margin-top: 0;">Hello${name
          ? ' ' + name
          : ''}!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #4b5563; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
                    <p style="color: #4b5563; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="background-color: #e5e7eb; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">${resetLink}</p>
                </div>
                <div style="color: #6b7280; font-size: 14px; text-align: center;">
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>© ${new Date().getFullYear()} Wanderlust - Jaimin Detroja. All rights reserved.</p>
                </div>
            </div>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    return {success: true, messageId: info.messageId};
  } catch (error) {
    console.error('Error sending reset email:', error);
    return {success: false, error: error.message};
  }
};

module.exports = {
  generateResetToken,
  decryptResetToken,
  saveResetToken,
  verifyResetToken,
  sendResetEmail,
}; 