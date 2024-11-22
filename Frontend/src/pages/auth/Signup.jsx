import React, { useState, useEffect, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import { UserContext } from "../../contexts/userContext"
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"

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
    const { setCurrUserAndCookies, getCurrUser } = useContext(UserContext)
    const [isObscureText, setIsObscureText] = useState(true)

    const { RiveComponent, rive } = useRive({
        src: "/animated_login_screen.riv", // Path to your Rive file
        stateMachines: "Login Machine", // Exact name of the state machine in your Rive file
        autoplay: true,
    })

    useEffect(() => {
        if (getCurrUser) {
            showWarningMessage("You are already logged in")
            navigate("/")
        }
        window.scrollTo(0, 0)
    })

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
        <div className="flex justify-center">
            <div className="w-3/4 lg:w-1/2">
                <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
                <div className="w-full max-w-md">
                    <RiveComponent className="h-80 w-full" />
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="needs-validation"
                    noValidate
                >
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className={`mt-1 block w-full px-3 py-2 border ${
                                errors.name
                                    ? "border-red-500"
                                    : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className={`mt-1 block w-full px-3 py-2 border ${
                                errors.email
                                    ? "border-red-500"
                                    : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                            <p className="text-red-500 text-sm">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={`mt-1 block w-full px-3 py-2 border ${
                                errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() =>
                                isHandsUp && (isHandsUp.value = true)
                            }
                            onBlur={() =>
                                isHandsUp && (isHandsUp.value = false)
                            }
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        {signupLoader ? <BeatLoader size={10} /> : "Submit"}
                    </button>
                </form>

                <p className="mt-4 text-center">
                    Already Registered?{" "}
                    <Link
                        to="/login"
                        className="text-indigo-600 hover:underline"
                    >
                        Click here to log in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Signup
