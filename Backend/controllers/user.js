const User = require('../models/user.js');

// Render Signup Form
module.exports.renderSignupForm = async (req, res) => {
    res.json({ message: "Render signup form" }); // Placeholder response
};

// User signup
module.exports.signup = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;
        const newUser = new User({ username, email, name });
        const registerUser = await User.register(newUser, password);

        req.login(registerUser, (err) => {
            if (err) return res.status(500).json({ error: 'Error logging in after signup' });
            res.status(201).json({ message: `Welcome to Wanderlust ${name}` }); // Send success message
        });
    } catch (e) {
        res.status(400).json({ error: e.message }); // Send error message
    }
};

// Render Login Form
module.exports.renderLoginForm = async (req, res) => {
    res.json({ message: "Render login form" }); // Placeholder response
};

// User login
module.exports.login = async (req, res) => {
    const user = await User.findOne({ 'username': req.body.username });
    if (user) {
        res.json({ message: `Welcome to Wanderlust ${user.name}` }); // Send success message
    } else {
        res.status(400).json({ error: 'Invalid username' }); // Send error message
    }
};

// User logout
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Error logging out' });
        res.json({ message: 'Logged out successfully' }); // Send success message
    });
};
