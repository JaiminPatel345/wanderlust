const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Generate a hashed password
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Validate a password against its hash
 * @param {string} password - The plain text password to validate
 * @param {string} hash - The stored hash to compare against
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
const validatePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Validate password format (at least 8 chars with letter and number)
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password meets requirements, false otherwise
 */
const isValidPasswordFormat = (password) => {
    // Minimum 6 characters, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
};

/**
 * Generate a random reset token
 * @returns {string} - The generated reset token
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a hashed reset token
 * @param {string} token - The token to hash
 * @returns {string} - The hashed token
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
    hashPassword,
    validatePassword,
    isValidPasswordFormat,
    generateResetToken,
    hashToken
}; 