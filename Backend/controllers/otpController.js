const User = require('../models/user.js');
const {generateOTP, saveOTP, verifyOTP, sendOTPEmail} = require(
    '../utilities/otpUtils.js');
const {AppError, formatResponse} = require('../utilities/errorHandler.js');

// Send OTP for verification
module.exports.sendOTP = async (req, res) => {
  const {email} = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Check if user exists
  const user = await User.findOne({email});
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If user is already verified, inform the client
  if (user.isValidatedEmail) {
    return res.status(200).json(
        formatResponse(true, 'Email is already verified', {isVerified: true}),
    );
  }

  // Generate OTP
  const otp = generateOTP();
  console.log(`Sending otp for ${email} to ${otp}`);

  // Save OTP to Redis
  const otpSaved = await saveOTP(email, otp);
  if (!otpSaved) {
    throw new AppError('Failed to generate OTP', 500);
  }

  // Send OTP via email
  const mailSent = await sendOTPEmail(email, otp, user.name);
  if (!mailSent.success) {
    throw new AppError(`Failed to send verification email: ${mailSent.error}`,
        500,
    );
  }

  res.status(200).json(
      formatResponse(true, 'Verification code sent to your email', {email}),
  );
};

// Verify OTP
module.exports.verifyOTP = async (req, res) => {
  const {email, otp} = req.body;

  if (!email || !otp) {
    throw new AppError('Email and OTP are required', 400);
  }

  // Verify OTP from Redis
  const verification = await verifyOTP(email, otp);
  if (!verification.valid) {
    throw new AppError(verification.message, 400);
  }

  // Update user's verification status
  const user = await User.findOneAndUpdate(
      {email},
      {isValidatedEmail: true},
      {new: true},
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if this is a new user (no profile photo yet)
  const isNewUser = !user.profilePhoto || user.profilePhoto === '';

  res.status(200).json(
      formatResponse(true, 'Email verified successfully', {
        user: {
          userId: user._id,
          email: user.email,
          name: user.name,
          profilePhoto: user.profilePhoto || '',
        },
        isNewUser,
      }),
  );
};

// Resend OTP
module.exports.resendOTP = async (req, res) => {
  const {email} = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Check if user exists
  const user = await User.findOne({email});
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If user is already verified, inform the client
  if (user.isValidatedEmail) {
    return res.status(200).json(
        formatResponse(true, 'Email is already verified', {isVerified: true}),
    );
  }

  // Generate OTP
  const otp = generateOTP();

  // Save OTP to Redis
  const otpSaved = await saveOTP(email, otp);
  if (!otpSaved) {
    throw new AppError('Failed to generate OTP', 500);
  }

  // Send OTP via email
  const mailSent = await sendOTPEmail(email, otp, user.name);
  if (!mailSent.success) {
    throw new AppError(`Failed to send verification email: ${mailSent.error}`,
        500,
    );
  }

  res.status(200).json(
      formatResponse(true, 'Verification code resent to your email', {email}),
  );
}; 