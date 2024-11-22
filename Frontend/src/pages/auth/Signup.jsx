import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import { UserContext } from "../../contexts/userContext"
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"
import { FaEye } from "react-icons/fa"
import { FaEyeSlash } from "react-icons/fa6"

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
    const { currUser, setCurrUserAndCookies } = useContext(UserContext)
    const [isPasswordShow, setIsPasswordShow] = useState(false)

    const { RiveComponent, rive } = useRive({
        src: "/animated_login_screen.riv", // Path to your Rive file
        stateMachines: "Login Machine", // Exact name of the state machine in your Rive file
        autoplay: true,
    })

    useEffect(() => {
        if (currUser) {
            navigate(-1) // Go back to the previous page
        }
        window.scrollTo(0, 0)
    }, [currUser, navigate])

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

        // Password validation (length and strength check)
        if (!formData.password || formData.password.length < 6) {
            formErrors.password = "Password must be at least 6 characters long"
            valid = false
        }
        if (Object.entries(formErrors > 0)) setErrors(formErrors)
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
        setSignupLoader(true)

        await fetch(`${process.env.VITE_API_BASE_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            }),
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        showErrorMessage(data.message)
                        throw {
                            message: data.message,
                            error: data.error,
                        }
                    })
                }
                return response.json()
            })
            .then((data) => {
                // Assuming the token is included in the response data
                if (data) {
                    setCurrUserAndCookies(data) //set cookies

                    showSuccessMessage(`Hi  ${data.user.name} 👋`)
                    if (trigSuccess) trigSuccess.fire()

                    setTimeout(() => {
                        window.history.go(-1)
                    }, 500)
                } else {
                    throw {
                        message: data.message,
                        error: data.error,
                    }
                }
            })
            .catch((error) => {
                console.log(error)
                if (trigFail) trigFail.fire()
                showErrorMessage(error?.message || "Unknown error")
            })
            .finally(() => {
                setSignupLoader(false)
            })
    }

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg gap-4">
                <div className="mb-4">
                    <div className="w-full">
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
                                            : "border-gray-300"
                                    } rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300`}
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
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-300 ease-in-out">
                            {signupLoader ? (
                                <BeatLoader size={10} color="white" />
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already registered?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:underline font-medium"
                    >
                        Click here to log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Signup
