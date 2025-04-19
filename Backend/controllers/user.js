const User = require("../models/user.js");
const { hashPassword, validatePassword, isValidPasswordFormat, generateResetToken, hashToken } = require("../utilities/passwordUtils.js");

// User signup
module.exports.signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(422).json({
                message: "Email, password, and name are required",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already in use",
            });
        }

        // Validate password format
        if (!isValidPasswordFormat(password)) {
            return res.status(400).json({
                message: "Password should be at least 6 characters and contain both letters and numbers",
            });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
        });

        // Save user to database
        const savedUser = await newUser.save();
        
        // Create session data
        const data = {
            userId: savedUser._id,
            email: savedUser.email,
            name: savedUser.name,
        };
        
        req.session.user = { ...data };
        
        res.status(201).json({
            user: data
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during signup",
            error: error.message,
        });
    }
};

// User login
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(422).json({
                message: "Email and password are required",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Validate password
        const isPasswordValid = await validatePassword(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Create session data
        const data = {
            userId: user._id,
            email: user.email,
            name: user.name,
        };
        
        req.session.user = { ...data };
        
        req.session.save((err) => {
            if (err) {
                console.error("Error saving session:", err);
            } else {
                console.log("Session saved successfully");
            }
        });
        
        return res.status(200).json({
            user: data
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during login",
            error: error.message,
        });
    }
};

// User logout
module.exports.logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy failed:", err);
                return res.status(500).json({
                    message: "Error during logout",
                    error: err.message,
                });
            }
            
            res.clearCookie("sessionId");
            res.status(200).json({
                message: "Logged out successfully"
            });
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({
            message: "Error during logout",
            error: error.message,
        });
    }
};

// Check if user is logged in
module.exports.isLogin = (req, res) => {
    res.send(req.session.user);
};

// Request password reset
module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            // We don't want to reveal which emails are in the database
            return res.status(200).json({
                message: "If your email exists in our system, you will receive a password reset link shortly"
            });
        }
        
        // Generate reset token
        const resetToken = generateResetToken();
        const hashedResetToken = hashToken(resetToken);
        
        // Set token expiration (1 hour)
        const tokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
        
        // Save token to user
        user.passwordResetToken = hashedResetToken;
        user.passwordResetExpires = tokenExpiration;
        await user.save();
        
        // In a real-world application, you would send an email with the reset link
        // For this example, we'll just return the token directly (not secure for production)
        console.log(`Reset token for ${email}: ${resetToken}`);
        
        res.status(200).json({
            message: "If your email exists in our system, you will receive a password reset link shortly",
            // Only include in development, remove in production
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        res.status(500).json({
            message: "An error occurred while processing your request"
        });
    }
};

// Reset password with token
module.exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }
        
        // Validate password format
        if (!isValidPasswordFormat(password)) {
            return res.status(400).json({
                message: "Password should be at least 8 characters and contain both letters and numbers"
            });
        }
        
        // Hash the token to compare with stored hash
        const hashedToken = hashToken(token);
        
        // Find user with valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                message: "Token is invalid or has expired"
            });
        }
        
        // Hash the new password
        const hashedPassword = await hashPassword(password);
        
        // Update user password and clear reset fields
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        res.status(200).json({
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({
            message: "An error occurred while resetting your password"
        });
    }
};

// Change password (for logged in users)
module.exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }
        
        if (!req.session.user) {
            return res.status(401).json({
                message: "You must be logged in to change your password"
            });
        }
        
        // Validate new password format
        if (!isValidPasswordFormat(newPassword)) {
            return res.status(400).json({
                message: "New password should be at least 8 characters and contain both letters and numbers"
            });
        }
        
        // Find user
        const user = await User.findById(req.session.user.userId);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        
        // Verify current password
        const isPasswordValid = await validatePassword(currentPassword, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Current password is incorrect"
            });
        }
        
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            message: "An error occurred while changing your password"
        });
    }
};