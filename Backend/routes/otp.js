const express = require("express");
const router = express.Router();
const asyncWrap = require("../utilities/wrapAsync.js");
const otpController = require("../controllers/otpController.js");
const { rateLimiters } = require("../utilities/rateLimiter.js");

// Route to send OTP
router.post("/send", rateLimiters.otpVerification, asyncWrap(otpController.sendOTP));

// Route to verify OTP
router.post("/verify", rateLimiters.otpVerification, asyncWrap(otpController.verifyOTP));

// Route to resend OTP
router.post("/resend", rateLimiters.otpVerification, asyncWrap(otpController.resendOTP));

module.exports = router; 