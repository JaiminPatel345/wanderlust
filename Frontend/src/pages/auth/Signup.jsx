import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import useUserStore from "../../store/userStore"
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
import { FaEye } from "react-icons/fa"
import { FaEyeSlash } from "react-icons/fa6"
import { FaCheck, FaTimes } from "react-icons/fa"

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    })

    const navigate = useNavigate()

    const [errors, setErrors] = useState({})
    const [signupLoader, setSignupLoader] = useState(false)
    const {
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
        clearFlashMessage,
    } = useContext(FlashMessageContext)
    const { currUser, register } = useUserStore()
    const [isPasswordShow, setIsPasswordShow] = useState(false)
    const [isRiveLoading, setIsRiveLoading] = useState(true)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    
    // Password validation states
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasLetter: false,
        hasNumber: false
    })

    // Add a state to track if we're in the registration process
    const [isRegistering, setIsRegistering] = useState(false);

    const { RiveComponent, rive } = useRive({
        src: "/animated_login_screen.riv", // Path to your Rive file
        stateMachines: "Login Machine", // Exact name of the state machine in your Rive file
        autoplay: true,
        onLoad: () => {
            setIsRiveLoading(false)
        },
        onLoadError: () => setIsRiveLoading(false),
    })

    useEffect(() => {
        // Only redirect if we're not in the middle of registration
        // and the user is already logged in
        if (currUser && currUser.isValidatedEmail && !isRegistering) {
            navigate('/', { replace: true })
        }
        window.scrollTo(0, 0)
    }, [currUser, navigate, isRegistering]) // Include all dependencies

    // Check password requirements whenever password changes
    useEffect(() => {
        const password = formData.password
        setPasswordValidation({
            minLength: password.length >= 6,
            hasLetter: /[a-zA-Z]/.test(password),
            hasNumber: /[0-9]/.test(password)
        })
    }, [formData.password])

    const isChecking = useStateMachineInput(rive, "Login Machine", "isChecking")
    const isHandsUp = useStateMachineInput(rive, "Login Machine", "isHandsUp")
    const trigSuccess = useStateMachineInput(
        rive,
        "Login Machine",
        "trigSuccess"
    )
    const trigFail = useStateMachineInput(rive, "Login Machine", "trigFail")
    const numLook = useStateMachineInput(rive, "Login Machine", "numLook")

    const handleChange = (e) => {
        if (numLook) {
            numLook.value = Math.min(e.target.value.length, 40)
        }
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        let formErrors = {}
        let valid = true

        // Name validation (non-empty)
        if (!formData.name.trim()) {
            formErrors.name = "Name is required"
            valid = false
        }

        // Email validation (basic format check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!formData.email || !emailRegex.test(formData.email)) {
            formErrors.email = "Invalid email address"
            valid = false
        }

        // Enhanced password validation
        const { minLength, hasLetter, hasNumber } = passwordValidation
        if (!minLength || !hasLetter || !hasNumber) {
            formErrors.password = "Password doesn't meet requirements"
            valid = false
        }
        
        if (Object.entries(formErrors).length > 0) setErrors(formErrors)
        return valid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Clear any previous flash message
        clearFlashMessage()

        if (!validateForm()) {
            showErrorMessage("Please correct the errors in the form.") // Set flash message
            if (trigFail) trigFail.fire()
            return
        }
        
        // Set registration flag to prevent unwanted redirects
        setIsRegistering(true)
        setSignupLoader(true)

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            })
            
            if (result.success) {
                if (result.requireVerification) {
                    // Show OTP-specific message
                    showSuccessMessage(`Verification code sent to ${formData.email}`)
                    if (trigSuccess) trigSuccess.fire()
                    
                    // Direct navigation to verify-otp without delay or intermediate redirects
                    navigate("/verify-otp", { 
                        state: { email: formData.email },
                        replace: true // Replace current route in history to prevent back navigation issues
                    })
                } else {
                    showSuccessMessage(`Hi ${formData.name || 'there'} 👋`)
                    if (trigSuccess) trigSuccess.fire()
                    
                    // Navigate to home page if no verification needed
                    navigate("/", { replace: true })
                }
            } else {
                if (trigFail) trigFail.fire()
                showErrorMessage(result.error || "Registration failed")
            }
        } catch (error) {
            console.error("Signup error:", error)
            if (trigFail) trigFail.fire()
            showErrorMessage(error.message || "Unknown error")
        } finally {
            setSignupLoader(false)
            // Reset registration flag
            setIsRegistering(false)
        }
    }

    // Animation class for validation items
    const getAnimationClass = (isValid) => {
        return isValid 
            ? "transform scale-100 opacity-100 transition-all duration-300" 
            : "transform scale-95 opacity-80 transition-all duration-300"
    }

    // Check if all password requirements are met
    const allRequirementsMet = 
        passwordValidation.minLength && 
        passwordValidation.hasLetter && 
        passwordValidation.hasNumber

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg gap-4">
                <div className="mb-4">
                    <div className="w-full">
                        {isRiveLoading && (
                            <div className="w-full flex justify-center items-center">
                                {" "}
                                <BeatLoader color="#b3dbd3" />
                            </div>
                        )}
                        <RiveComponent className="h-72 w-full" />
                    </div>
                </div>

                <div className="">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
                        Sign Up
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={`w-full px-3 py-2 border ${
                                    errors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300`}
                                value={formData.name}
                                onChange={handleChange}
                                onFocus={() =>
                                    isChecking && (isChecking.value = true)
                                }
                                onBlur={() =>
                                    isChecking && (isChecking.value = false)
                                }
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`w-full px-3 py-2 border ${
                                    errors.email
                                        ? "border-red-500"
                                        : "border-gray-300"
                                } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300`}
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() =>
                                    isChecking && (isChecking.value = true)
                                }
                                onBlur={() =>
                                    isChecking && (isChecking.value = false)
                                }
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email}
                                </p>
                            )}
                            <p className="text-amber-600 text-sm mt-1 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                OTP will be sent to this email address
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={isPasswordShow ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className={`w-full px-3 py-2 pr-10 border ${
                                        errors.password
                                            ? "border-red-500"
                                            : allRequirementsMet && formData.password.length > 0
                                              ? "border-green-500"
                                            : "border-gray-300"
                                    } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => {
                                        if (isHandsUp && !isPasswordShow) {
                                            isHandsUp.value = true
                                        }
                                        setIsPasswordFocused(true)
                                    }}
                                    onBlur={() => {
                                        if (isHandsUp) {
                                            isHandsUp.value = false
                                        }
                                        setIsPasswordFocused(false)
                                    }}
                                    required
                                />
                                <span
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition"
                                    onClick={() =>
                                        setIsPasswordShow((pvs) => !pvs)
                                    }
                                >
                                    {isPasswordShow ? (
                                        <FaEye />
                                    ) : (
                                        <FaEyeSlash />
                                    )}
                                </span>
                            </div>
                            
                            {/* Password requirements */}
                            {(isPasswordFocused || formData.password) && (
                                <div className="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200 space-y-2 transition-all duration-300 ease-in-out">
                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Password requirements:</h3>
                                    <div className={`flex items-center gap-2 ${getAnimationClass(passwordValidation.minLength)}`}>
                                        {passwordValidation.minLength ? (
                                            <FaCheck className="text-green-500" />
                                        ) : (
                                            <FaTimes className="text-red-500" />
                                        )}
                                        <span className={`text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                                            At least 6 characters
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${getAnimationClass(passwordValidation.hasLetter)}`}>
                                        {passwordValidation.hasLetter ? (
                                            <FaCheck className="text-green-500" />
                                        ) : (
                                            <FaTimes className="text-red-500" />
                                        )}
                                        <span className={`text-sm ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-600'}`}>
                                            At least one letter
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${getAnimationClass(passwordValidation.hasNumber)}`}>
                                        {passwordValidation.hasNumber ? (
                                            <FaCheck className="text-green-500" />
                                        ) : (
                                            <FaTimes className="text-red-500" />
                                        )}
                                        <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                                            At least one number
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md 
                    hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                    focus:ring-offset-2 transition duration-300 ease-in-out"
                        >
                            {signupLoader ? (
                                <BeatLoader size={10} color="white" />
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Signup
