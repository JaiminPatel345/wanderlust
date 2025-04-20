const User = require("../models/user.js");
const { hashPassword, validatePassword, isValidPasswordFormat, generateResetToken, hashToken } = require("../utilities/passwordUtils.js");
const { generateOTP, saveOTP, sendOTPEmail } = require("../utilities/otpUtils.js");
const { AppError, formatResponse } = require("../utilities/errorHandler.js");
const { generateSignature } = require("../utilities/cloudinaryUtils.js");
const { generateResetToken: generatePasswordResetToken, decryptResetToken, saveResetToken, verifyResetToken, sendResetEmail } = require("../utilities/resetPasswordUtils.js");
const Listing = require("../models/listing.js");

// User signup
module.exports.signup = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        throw new AppError("Email, password, and name are required", 422);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("Email already in use", 409);
    }

    // Validate password format
    if (!isValidPasswordFormat(password)) {
        throw new AppError("Password should be at least 6 characters and contain both letters and numbers", 400);
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
        email,
        name,
        password: hashedPassword,
        isValidatedEmail: false,
    });

    // Save user to database
    const savedUser = await newUser.save();
    
    // Create session data
    const data = {
        userId: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        isValidatedEmail: savedUser.isValidatedEmail,
    };
    
    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to Redis
    const otpSaved = await saveOTP(email, otp);
    if (!otpSaved) {
        // If OTP couldn't be saved, delete the user and throw an error
        await User.findByIdAndDelete(savedUser._id);
        throw new AppError("Failed to generate verification code", 500);
    }
    
    // Send OTP via email
    const mailSent = await sendOTPEmail(email, otp, name);
    if (!mailSent.success) {
        // If email couldn't be sent, delete the user and OTP, then throw an error
        await User.findByIdAndDelete(savedUser._id);
        // No need to manually delete OTP from Redis as it will expire
        throw new AppError(`Failed to send verification email: ${mailSent.error}`, 500);
    }
    
    // Only set session if everything succeeded
    req.session.user = { ...data };
    
    res.status(201).json(
        formatResponse(true, "User registered successfully. Please verify your email.", {
            user: data,
            requireVerification: true
        })
    );
};

// User login
module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError("Email and password are required", 422);
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    // Validate password
    const isPasswordValid = await validatePassword(password, user.password);
    
    if (!isPasswordValid) {
        throw new AppError("Invalid credentials", 401);
    }

    // Check if email is verified
    if (!user.isValidatedEmail) {
        // Generate new OTP
        const otp = generateOTP();
        
        // Save OTP to Redis
        const otpSaved = await saveOTP(email, otp);
        if (!otpSaved) {
            throw new AppError("Failed to generate verification code", 500);
        }
        
        // Send OTP via email
        const mailSent = await sendOTPEmail(email, otp, user.name);
        if (!mailSent.success) {
            throw new AppError(`Failed to send verification email: ${mailSent.error}`, 500);
        }
        
        return res.status(403).json(
            formatResponse(false, "Email not verified. A new verification code has been sent.", {
                requireVerification: true,
                email: user.email
            })
        );
    }

    // Create session data
    const data = {
        userId: user._id,
        email: user.email,
        name: user.name,
        profilePhoto: user.profilePhoto || ''
    };
    
    req.session.user = { ...data };
    
    req.session.save((err) => {
        if (err) {
            console.error("Error saving session:", err);
        } else {
            console.log("Session saved successfully");
        }
    });
    
    return res.status(200).json(
        formatResponse(true, "Login successful", { user: data })
    );
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
    if (!req.session.user) {
        return res.status(401).json(
            formatResponse(false, "Not logged in", null)
        );
    }
    
    return res.status(200).json(
        formatResponse(true, "User is logged in", { 
            user: req.session.user 
        })
    );
};

// Request password reset
module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new AppError("Email is required", 400);
    }
    
    try {
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            // We don't want to reveal which emails are in the database
            return res.status(200).json(
                formatResponse(true, "If your email exists in our system, you will receive a password reset link shortly", null)
            );
        }
        
        // Generate random token
        const encryptedToken = generatePasswordResetToken(user._id.toString());
        
        // Extract token from the encrypted payload for storage in Redis
        const decoded = decryptResetToken(encryptedToken);
        
        if (!decoded) {
            throw new AppError("Failed to generate reset token", 500);
        }
        
        // Save token to Redis with user ID as part of the key
        const tokenSaved = await saveResetToken(user._id.toString(), decoded.token);
        
        if (!tokenSaved) {
            throw new AppError("Failed to generate reset token", 500);
        }
        
        // Send email with reset link
        const emailResult = await sendResetEmail(email, user.name, encryptedToken);
        
        if (!emailResult.success) {
            throw new AppError(`Failed to send reset email: ${emailResult.error}`, 500);
        }
        
        // For development only
        console.log(`Reset link for ${email}: ${process.env.REACT_APP_API_URL}/reset-password?token=${encodeURIComponent(encryptedToken)}`);
        
        return res.status(200).json(
            formatResponse(true, "If your email exists in our system, you will receive a password reset link shortly", 
                process.env.NODE_ENV === 'development' ? { encryptedToken } : null
            )
        );
    } catch (error) {
        console.error("Password reset request error:", error);
        throw new AppError("An error occurred while processing your request", 500);
    }
};

// Reset password with token
module.exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        throw new AppError("Token and new password are required", 400);
    }
    
    // Validate password format
    if (!isValidPasswordFormat(password)) {
        throw new AppError("Password should be at least 6 characters and contain both letters and numbers", 400);
    }
    
    try {
        // Decrypt and validate the token
        const decoded = decryptResetToken(token);
        
        if (!decoded || !decoded.userId || !decoded.token) {
            throw new AppError("Invalid or expired reset token", 400);
        }
        
        // Verify token in Redis
        const isValidToken = await verifyResetToken(decoded.userId, decoded.token);
        
        if (!isValidToken) {
            throw new AppError("Invalid or expired reset token", 400);
        }
        
        // Find user by ID
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new AppError("User not found", 404);
        }
        
        // Hash the new password
        const hashedPassword = await hashPassword(password);
        
        // Update user's password
        user.password = hashedPassword;
        await user.save();
        
        return res.status(200).json(
            formatResponse(true, "Password has been reset successfully", null)
        );
    } catch (error) {
        console.error("Password reset error:", error);
        if (error instanceof AppError) {
            throw error;
        } else {
            throw new AppError("An error occurred while resetting your password", 500);
        }
    }
};

// Change password (for logged in users)
module.exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        throw new AppError("Current password and new password are required", 400);
    }
    
    const userId = req.session.user?.userId;
    if (!userId) {
        throw new AppError("You must be logged in to change your password", 401);
    }
    
    // Validate new password format
    if (!isValidPasswordFormat(newPassword)) {
        throw new AppError("New password should be at least 6 characters and contain both letters and numbers", 400);
    }
    
    try {
        // Find user
        const user = await User.findById(userId);
        
        if (!user) {
            throw new AppError("User not found", 404);
        }
        
        // Verify current password
        const isPasswordValid = await validatePassword(currentPassword, user.password);
        
        if (!isPasswordValid) {
            throw new AppError("Current password is incorrect", 401);
        }
        
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        return res.status(200).json(
            formatResponse(true, "Password changed successfully", null)
        );
    } catch (error) {
        console.error("Change password error:", error);
        if (error instanceof AppError) {
            throw error;
        } else {
            throw new AppError("An error occurred while changing your password", 500);
        }
    }
};

// Get Cloudinary upload signature
module.exports.getCloudinarySignature = (req, res) => {
    try {
        const userId = req.session.user?.userId;
        
        if (!userId) {
            throw new AppError("Not authorized", 401);
        }
        
        // Check if Cloudinary environment variables are available
        if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
            console.error("Missing Cloudinary environment variables:", {
                CLOUD_NAME: !!process.env.CLOUD_NAME, 
                CLOUD_API_KEY: !!process.env.CLOUD_API_KEY, 
                CLOUD_API_SECRET: !!process.env.CLOUD_API_SECRET
            });
            throw new AppError("Server configuration error", 500);
        }
        
        // Generate a unique public ID based on user ID
        // This will allow overwriting the image when user updates profile
        const publicId = `user_profiles/user_${userId}`;
        
        // Parameters for the upload
        // These will be included in the signature
        const params = {
            public_id: publicId,
            folder: 'user_profiles',
            overwrite: true
        };
        
        // Generate signature
        const signatureData = generateSignature(params);
        
        console.log("Generated Cloudinary signature data for upload");
        
        res.status(200).json(
            formatResponse(true, "Signature generated successfully", signatureData)
        );
    } catch (error) {
        console.error("Error generating Cloudinary signature:", error);
        throw new AppError("Failed to generate upload signature", 500);
    }
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
    const { profilePhoto } = req.body;
    const userId = req.session.user?.userId;

    if (!userId) {
        throw new AppError("Not authorized", 401);
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePhoto },
            { new: true }
        );

        if (!updatedUser) {
            throw new AppError("User not found", 404);
        }

        // Update session with the new profile photo
        req.session.user = {
            ...req.session.user,
            profilePhoto: updatedUser.profilePhoto
        };

        res.status(200).json(
            formatResponse(true, "Profile updated successfully", {
                user: {
                    userId: updatedUser._id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    profilePhoto: updatedUser.profilePhoto
                }
            })
        );
    } catch (error) {
        console.error("Error updating profile:", error);
        throw new AppError("Failed to update profile", 500);
    }
};

// Get user profile
module.exports.getProfile = async (req, res) => {
    const userId = req.session.user?.userId;

    if (!userId) {
        throw new AppError("Not authorized", 401);
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        res.status(200).json(
            formatResponse(true, "Profile retrieved successfully", {
                user: {
                    userId: user._id,
                    email: user.email,
                    name: user.name,
                    profilePhoto: user.profilePhoto
                }
            })
        );
    } catch (error) {
        console.error("Error getting profile:", error);
        throw new AppError("Failed to get profile", 500);
    }
};

// Update user name
module.exports.updateName = async (req, res) => {
    const { name } = req.body;
    const userId = req.session.user?.userId;

    if (!userId) {
        throw new AppError("Not authorized", 401);
    }

    if (!name || name.trim() === '') {
        throw new AppError("Name cannot be empty", 400);
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name },
            { new: true }
        );

        if (!updatedUser) {
            throw new AppError("User not found", 404);
        }

        // Update session with the new name
        req.session.user = {
            ...req.session.user,
            name: updatedUser.name
        };

        res.status(200).json(
            formatResponse(true, "Name updated successfully", {
                user: {
                    userId: updatedUser._id,
                    email: updatedUser.email,
                    name: updatedUser.name,
                    profilePhoto: updatedUser.profilePhoto
                }
            })
        );
    } catch (error) {
        console.error("Error updating name:", error);
        throw new AppError("Failed to update name", 500);
    }
};

// Bookmark controller functions
module.exports.getBookmarks = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const user = await User.findById(userId).populate('bookmarks');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            bookmarks: user.bookmarks
        });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports.addBookmark = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const { listingId } = req.params;
        
        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }
        
        // Add bookmark if not already added
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if already bookmarked
        if (user.bookmarks.includes(listingId)) {
            return res.status(400).json({
                success: false,
                message: "Listing already bookmarked"
            });
        }
        
        // Add to bookmarks
        user.bookmarks.push(listingId);
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Bookmark added successfully"
        });
    } catch (error) {
        console.error("Error adding bookmark:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports.removeBookmark = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const { listingId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Check if bookmark exists
        if (!user.bookmarks.includes(listingId)) {
            return res.status(400).json({
                success: false,
                message: "Bookmark not found"
            });
        }
        
        // Remove from bookmarks
        user.bookmarks = user.bookmarks.filter(id => id.toString() !== listingId);
        await user.save();
        
        res.status(200).json({
            success: true,
            message: "Bookmark removed successfully"
        });
    } catch (error) {
        console.error("Error removing bookmark:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
