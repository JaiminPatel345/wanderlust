import React, { useEffect, useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import useUserStore from "../../store/userStore"
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
import { FaEye } from "react-icons/fa"
import { FaEyeSlash } from "react-icons/fa6"

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const {
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
    } = useContext(FlashMessageContext)
    const [loginLoader, setLoginLoader] = useState(false)
    const { currUser, login } = useUserStore()
    const [isPasswordShow, setIsPasswordShow] = useState(false)
    const [isRiveLoading, setIsRiveLoading] = useState(true)
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const navigate = useNavigate()

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
        // Only redirect if we're not in the middle of login
        // and the user is already logged in
        if (currUser && currUser.isValidatedEmail && !isLoggingIn) {
            navigate('/', { replace: true });
        }
        window.scrollTo(0, 0);
    }, [currUser, navigate, isLoggingIn]); // Include all dependencies

    // Retrieve State Machine Inputs
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.email.length === 0 || formData.password.length === 0) {
            showErrorMessage("Email or Password can't be empty")
            if (trigFail) trigFail.fire()
            return
        }

        // Set login flag to prevent unwanted redirects
        setIsLoggingIn(true)
        setLoginLoader(true)
        if (isHandsUp) isHandsUp.value = false

        try {
            const result = await login(formData.email, formData.password)
            
            if (result.success) {
                showSuccessMessage(`Welcome back!`)
                if (trigSuccess) trigSuccess.fire()

                // Navigate to home page with replace to avoid intermediate redirects
                navigate("/", { replace: true })
            } else {
                // Check if email verification is required
                if (result.requireVerification) {
                    showWarningMessage(`Verification code sent to ${formData.email}`)
                    if (trigFail) trigFail.fire()
                    
                    // Direct navigation to verify OTP page
                    navigate("/verify-otp", { 
                        state: { email: formData.email },
                        replace: true
                    })
                } else {
                    if (trigFail) trigFail.fire()
                    showErrorMessage(result.error || "Login failed")
                }
            }
        } catch (error) {
            console.error("Login error:", error)
            if (trigFail) trigFail.fire()
            showErrorMessage(error.message || "Unknown error")
        } finally {
            setLoginLoader(false)
            // Reset login flag
            setIsLoggingIn(false)
        }
    }

    return (
        <div className="flex justify-center items-center  ">
            <div className="w-full max-w-md p-8  bg-white rounded-xl shadow-lg gap-4">
                <div className="mb-4">
                    <div className="w-full ">
                        {isRiveLoading && (
                            <div className="w-full flex justify-center items-center">
                                {" "}
                                <BeatLoader color="#b3dbd3" />
                            </div>
                        )}
                        <RiveComponent className="h-72 w-full " />
                    </div>
                </div>

                <div className="">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
                        Login
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4 ">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() =>
                                    isChecking && (isChecking.value = true)
                                }
                                onBlur={() =>
                                    isChecking && (isChecking.value = false)
                                }
                            />
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 pr-10"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() =>
                                        isHandsUp &&
                                        !isPasswordShow &&
                                        (isHandsUp.value = true)
                                    }
                                    onBlur={() =>
                                        isHandsUp && (isHandsUp.value = false)
                                    }
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
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-red-600 hover:underline font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md 
                    hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                    focus:ring-offset-2 transition duration-300 ease-in-out"
                        >
                            {loginLoader ? (
                                <BeatLoader size={10} color="white" />
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-600 mt-4">
                    New user?{" "}
                    <Link
                        to="/signup"
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login
