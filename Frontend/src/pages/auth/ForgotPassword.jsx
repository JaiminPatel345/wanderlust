import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FlashMessageContext } from "../../utils/flashMessageContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showSuccessMessage, showErrorMessage } = useContext(FlashMessageContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorMessage("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/forgot-password`,
        { email },
        { withCredentials: true }
      );
      
      setEmailSent(true);
      showSuccessMessage(response.data.message ||"If your email exists in our system, you will receive a password reset link shortly");
    } catch (error) {
      console.error("Forgot password error:", error);
      showErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
          {!emailSent ? (
            <p className="mt-2 text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          ) : (
            <p className="mt-2 text-green-600">
              Check your email for the reset link
            </p>
          )}
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "Send Reset Link"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-red-500 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-gray-600">
              A reset link has been sent to your email address if it exists in our system.
            </p>
            <p className="text-gray-600">
              Please check your inbox and spam folder.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 