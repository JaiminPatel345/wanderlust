const User = require('../models/user.js');
const {
  hashPassword,
  validatePassword,
  isValidPasswordFormat,
} = require('../utilities/passwordUtils.js');
const {
  generateOTP, saveOTP, sendOTPEmail,
} = require('../utilities/otpUtils.js');
const {AppError, formatResponse} = require('../utilities/errorHandler.js');
const {generateSignature} = require('../utilities/cloudinaryUtils.js');
const {generateToken} = require('../utilities/tokenUtils.js');
const {
  generateResetToken: generatePasswordResetToken,
  decryptResetToken,
  saveResetToken,
  verifyResetToken,
  sendResetEmail,
} = require('../utilities/resetPasswordUtils.js');
const Listing = require('../models/listing.js');
const crypto = require('crypto');

// User signup
module.exports.signup = async (req, res) => {
  const {email, password, name} = req.body;

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 422);
  }

  // Check if user already exists
  const existingUser = await User.findOne({email});
  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  // Validate password format
  if (!isValidPasswordFormat(password)) {
    throw new AppError(
        'Password should be at least 6 characters and contain both letters and numbers',
        400,
    );
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser = new User({
    email, name, password: hashedPassword, isValidatedEmail: false,
  });

  // Save user to database
  const savedUser = await newUser.save();

  // Create user data
  const data = {
    userId: savedUser._id,
    email: savedUser.email,
    name: savedUser.name,
    isValidatedEmail: savedUser.isValidatedEmail,
  };

  // Generate JWT token
  const token = generateToken(savedUser);

  // Generate OTP
  const otp = generateOTP();

  // Save OTP to Redis
  const otpSaved = await saveOTP(email, otp);
  if (!otpSaved) {
    // If OTP couldn't be saved, delete the user and throw an error
    await User.findByIdAndDelete(savedUser._id);
    throw new AppError('Failed to generate verification code', 500);
  }

  // Send OTP via email
  const mailSent = await sendOTPEmail(email, otp, name);
  if (!mailSent.success) {
    // If email couldn't be sent, delete the user and OTP, then throw an error
    await User.findByIdAndDelete(savedUser._id);
    // No need to manually delete OTP from Redis as it will expire
    throw new AppError(`Failed to send verification email: ${mailSent.error}`,
        500,
    );
  }

  res.status(201).json(formatResponse(true,
      'User registered successfully. Please verify your email.',
      {
        user: data,
        requireVerification: true,
        token,
      },
  ));
};

// User login
module.exports.login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 422);
  }

  // Find user by email
  const user = await User.findOne({email});

  // Check if user exists
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Validate password
  const isPasswordValid = await validatePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if email is verified
  if (!user.isValidatedEmail) {
    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to Redis
    const otpSaved = await saveOTP(email, otp);
    if (!otpSaved) {
      throw new AppError('Failed to generate verification code', 500);
    }

    // Send OTP via email
    const mailSent = await sendOTPEmail(email, otp, user.name);
    if (!mailSent.success) {
      throw new AppError(`Failed to send verification email: ${mailSent.error}`,
          500,
      );
    }

    return res.status(403).json(formatResponse(false,
        'Email not verified. A new verification code has been sent.',
        {
          requireVerification: true,
          email: user.email,
        },
    ));
  }

  // Generate JWT token
  const token = generateToken(user);

  // Create user data
  const data = {
    userId: user._id,
    email: user.email,
    name: user.name,
    profilePhoto: user.profilePhoto || '',
    expDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //7 days
  };

  return res.status(200).json(formatResponse(true,
      'Login successful',
      {
        user: data,
        token,
      },
  ));
};

// User logout (JWT tokens are handled client-side)
module.exports.logout = (req, res) => {
  res.status(200).json({
    message: 'Logged out successfully',
  });
};

// Check if user is logged in
module.exports.isLogin = (req, res) => {
  if (req.user) {
    return res.status(200).json(formatResponse(true, 'User is logged in', {
      user: {
        userId: req.user.userId,
        email: req.user.email,
        name: req.user.name,
        profilePhoto: req.user.profilePhoto || '',
      },
    }));
  }

  return res.status(401).json(formatResponse(false, 'Not logged in', null));
};

// Request password reset
module.exports.forgotPassword = async (req, res) => {
  const {email} = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  try {
    // Find user by email
    const user = await User.findOne({email});

    if (!user) {
      // We don't want to reveal which emails are in the database
      return res.status(200).json(formatResponse(true,
          'Send ! see your spam folder also',
          null,
      ));
    }

    // Generate reset token
    const {resetToken, token} = generatePasswordResetToken(email);

    // Save reset token to Redis
    const tokenSaved = await saveResetToken(email, token);
    if (!tokenSaved) {
      throw new AppError('Failed to generate reset token', 500);
    }

    // Send reset email
    const mailSent = await sendResetEmail(email, user.name, resetToken);
    if (!mailSent.success) {
      throw new AppError(`Failed to send reset email: ${mailSent.error}`, 500);
    }

    res.status(200).json(formatResponse(true,
        'Send ! see your spam folder also',
        null,
    ));
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    throw new AppError('Failed to process password reset request', 500);
  }
};

// Reset password with token
module.exports.resetPassword = async (req, res) => {
  const {token, password} = req.body;

  if (!token || !password) {
    throw new AppError('Token and new password are required', 400);
  }

  // Validate password format
  if (!isValidPasswordFormat(password)) {
    throw new AppError(
        'Password should be at least 6 characters and contain both letters and numbers',
        400,
    );
  }
  try {
    // Decrypt and validate the token
    const decoded = decryptResetToken(token);

    if (!decoded || !decoded.email || !decoded.token) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Verify token in Redis
    const isValidToken = await verifyResetToken(decoded.email, decoded.token);

    if (!isValidToken) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const newPassword = await hashPassword(password);

    const DbUser = await User.findOneAndUpdate({email: decoded.email},
        {
          password: newPassword,
        },
    );

    if (!DbUser) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(formatResponse(true,
        'Password has been reset successfully',
        null,
    ));
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError('An error occurred while resetting your password',
          500,
      );
    }
  }
};

// Change password (for logged in users)
module.exports.changePassword = async (req, res) => {
  const {currentPassword, newPassword} = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('You must be logged in to change your password', 401);
  }

  // Validate new password format
  if (!isValidPasswordFormat(newPassword)) {
    throw new AppError(
        'New password should be at least 6 characters and contain both letters and numbers',
        400,
    );
  }

  try {
    // Find user
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await validatePassword(currentPassword,
        user.password,
    );

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json(formatResponse(true,
        'Password changed successfully',
        null,
    ));
  } catch (error) {
    console.error('Change password error:', error);
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError('An error occurred while changing your password', 500);
    }
  }
};

// Get Cloudinary upload signature
module.exports.getCloudinarySignature = (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Not authorized', 401);
    }

    const {type} = req.query;
    let publicId;
    if (type && type === 'listing') {
      publicId = crypto.randomBytes(7).toString('hex');
    } else {
      publicId = `user_${userId}`;
    }

    const params = {
      public_id: publicId,
      folder: `wanderlust/${type && type === 'listing'
          ? `listings/user_${userId}`
          : 'user_profiles'}`,
      overwrite: true,
    };

    // Generate signature
    const signatureData = generateSignature(params);

    res.status(200).json(formatResponse(true,
        'Signature generated successfully',
        signatureData,
    ));
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    throw new AppError('Failed to generate upload signature', 500);
  }
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
  const {profilePhoto} = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Not authorized', 401);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId,
        {profilePhoto},
        {new: true},
    );

    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json(formatResponse(true, 'Profile updated successfully', {
      user: {
        userId: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePhoto: updatedUser.profilePhoto,
      },
    }));
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new AppError('Failed to update profile', 500);
  }
};

// Get user profile
module.exports.getProfile = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Not authorized', 401);
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json(formatResponse(true,
        'Profile retrieved successfully',
        {
          user: {
            userId: user._id,
            email: user.email,
            name: user.name,
            profilePhoto: user.profilePhoto,
          },
        },
    ));
  } catch (error) {
    console.error('Error getting profile:', error);
    throw new AppError('Failed to get profile', 500);
  }
};

// Update user name
module.exports.updateName = async (req, res) => {
  const {name} = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Not authorized', 401);
  }

  if (!name || name.trim() === '') {
    throw new AppError('Name cannot be empty', 400);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId,
        {name},
        {new: true},
    );

    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json(formatResponse(true, 'Name updated successfully', {
      user: {
        userId: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePhoto: updatedUser.profilePhoto,
      },
    }));
  } catch (error) {
    console.error('Error updating name:', error);
    throw new AppError('Failed to update name', 500);
  }
};

// Bookmark controller functions
module.exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('bookmarks');

    if (!user) {
      return res.status(404).json(formatResponse(false,
          'User not found',
          null,
      ));
    }

    return res.status(200).json(formatResponse(true,
        'Bookmarks retrieved successfully',
        {
          bookmarks: user.bookmarks,
        },
    ));
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return res.status(500).json(formatResponse(false,
        'Internal server error',
        null,
    ));
  }
};

module.exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {listingId} = req.params;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json(formatResponse(false,
          'Listing not found',
          null,
      ));
    }

    // Add bookmark if not already added
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false,
          'User not found',
          null,
      ));
    }

    // Check if already bookmarked
    if (user.bookmarks.includes(listingId)) {
      return res.status(400).json(formatResponse(false,
          'Listing already bookmarked',
          null,
      ));
    }

    // Add to bookmarks
    user.bookmarks.push(listingId);
    await user.save();

    return res.status(200).json(formatResponse(true,
        'Bookmark added successfully',
        null,
    ));
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return res.status(500).json(formatResponse(false,
        'Internal server error',
        null,
    ));
  }
};

module.exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {listingId} = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(formatResponse(false,
          'User not found',
          null,
      ));
    }

    // Check if bookmark exists
    if (!user.bookmarks.includes(listingId)) {
      return res.status(400).json(formatResponse(false,
          'Bookmark not found',
          null,
      ));
    }

    // Remove from bookmarks
    user.bookmarks = user.bookmarks.filter(id => id.toString() !== listingId);
    await user.save();

    return res.status(200).json(formatResponse(true,
        'Bookmark removed successfully',
        null,
    ));
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return res.status(500).json(formatResponse(false,
        'Internal server error',
        null,
    ));
  }
};
