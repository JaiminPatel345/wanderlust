const express = require("express");
const router = express.Router();
const asyncWrap = require("../utilities/wrapAsync.js");
const otpController = require("../controllers/otpController.js");

// Route to send OTP
router.post("/send", asyncWrap(otpController.sendOTP));

// Route to verify OTP
router.post("/verify", asyncWrap(otpController.verifyOTP));

// Route to resend OTP
router.post("/resend", asyncWrap(otpController.resendOTP));

module.exports = router; 