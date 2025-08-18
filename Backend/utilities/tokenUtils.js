const jwt = require('jsonwebtoken');

// Generate JWT token
module.exports.generateToken = (user) => {
    const payload = {
        userId: user._id
    };
    
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' }
    );
};

// Verify JWT token
module.exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}; 