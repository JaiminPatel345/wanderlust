import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { FlashMessageContext } from "../../utils/flashMessageContext";
import useUserStore from "../../store/userStore";

const VerifyOTP = () => {
    const [verifyLoader, setVerifyLoader] = useState(false);
    const [resendLoader, setResendLoader] = useState(false);
    const {
        showSuccessMessage,
        showErrorMessage,
        clearFlashMessage,
    } = useContext(FlashMessageContext);
    const { currUser, verifyOTP, resendOTP } = useUserStore();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Email from location state or query params
    const [email, setEmail] = useState(() => {
        const params = new URLSearchParams(location.search);
        return location.state?.email || params.get("email") || "";
    });
    
    // OTP input refs
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];
    
    // OTP input values
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    
    const [isVerifying, setIsVerifying] = useState(false);
    
    useEffect(() => {
        // If email is not available, redirect to login
        if (!email) {
            navigate("/login");
            return;
        }
        
        // If already logged in and verified, and not currently verifying, redirect to home
        if (currUser && currUser.isValidatedEmail && !isVerifying) {
            navigate("/", { replace: true });
        }
        
        // Focus first input when component mounts
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }
        
        window.scrollTo(0, 0);
    }, [email, currUser, navigate, isVerifying]);
    
    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;
        
        // Update OTP values
        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);
        
        // Move to next input if current is filled
        if (value.length === 1 && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };
    
    // Handle pasting OTP
    const handlePaste = (e, index) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        
        // Check if pasted data contains only digits and is of appropriate length
        if (!/^\d+$/.test(pastedData)) return;
        
        // Fill in OTP fields with pasted data
        const newOtpValues = [...otpValues];
        const pastedChars = pastedData.split('');
        
        // Fill as many fields as we have characters (up to 6)
        for (let i = 0; i < Math.min(6, pastedChars.length); i++) {
            newOtpValues[i] = pastedChars[i];
        }
        
        setOtpValues(newOtpValues);
        
        // Focus on the appropriate field
        const nextIndex = Math.min(5, index + pastedChars.length);
        if (nextIndex < 6) {
            inputRefs[nextIndex].current.focus();
        } else {
            // If all fields are filled, focus on the last one
            inputRefs[5].current.focus();
        }
    };
    
    // Handle backspace key
    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        clearFlashMessage();
        
        // Check if OTP is complete
        const otpString = otpValues.join("");
        if (otpString.length !== 6) {
            showErrorMessage("Please enter the complete 6-digit verification code");
            return;
        }
        
        // Set verification flag to prevent unwanted redirects
        setIsVerifying(true);
        setVerifyLoader(true);
        
        try {
            const result = await verifyOTP(email, otpString);
            
            if (result.success) {
                showSuccessMessage("Email verified successfully!");
                
                // Direct navigation without setTimeout
                if (result.isNewUser) {
                    navigate("/profile-setup", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } else {
                showErrorMessage(result.error || "Verification failed");
            }
        } catch (error) {
            console.error("OTP verification error:", error);
            showErrorMessage(error.message || "Verification failed");
        } finally {
            setVerifyLoader(false);
            // Reset verification flag
            setIsVerifying(false);
        }
    };
    
    // Handle resend OTP
    const handleResendOTP = async () => {
        clearFlashMessage();
        setResendLoader(true);
        
        try {
            const result = await resendOTP(email);
            
            if (result.success) {
                showSuccessMessage(result.message || "A new verification code has been sent to your email");
            } else {
                showErrorMessage(result.error || "Failed to resend verification code");
            }
        } catch (error) {
            console.error("Resend OTP error:", error);
            showErrorMessage(error.message || "Failed to resend verification code");
        } finally {
            setResendLoader(false);
        }
    };
    
    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
                        Verify Your Email
                    </h2>
                    <p className="text-center text-gray-600 mb-6">
                        We&apos;ve sent a 6-digit verification code to<br />
                        <span className="font-medium text-gray-800">{email}</span>
                    </p>
                    <p className="text-blue-600 text-sm text-center mb-6 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Please check your spam folder if you don't see the email
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 mb-6">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    maxLength={1}
                                    value={otpValues[index]}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={(e) => handlePaste(e, index)}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ease-in-out"
                        >
                            {verifyLoader ? <BeatLoader size={10} color="white" /> : "Verify"}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Didn&apos;t receive the code?{" "}
                            <button
                                onClick={handleResendOTP}
                                disabled={resendLoader}
                                className="text-indigo-600 hover:underline font-medium disabled:text-gray-400"
                            >
                                {resendLoader ? "Sending..." : "Resend"}
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Back to{" "}
                            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP; 