import React, { useEffect, useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import { UserContext } from "../../contexts/userContext"
import { useRive, useStateMachineInput } from "@rive-app/react-canvas"

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const {
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
        clearFlashMessage,
    } = useContext(FlashMessageContext)
    const [loginLoader, setLoginLoader] = useState(false)
    const { setCurrUserAndCookies, getCurrUser } = useContext(UserContext)
    const [isObscureText, setIsObscureText] = useState(true)
    const navigate = useNavigate()

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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.email.length == 0 || formData.password.length == 0) {
            showErrorMessage("Email or Password can't be empty ")
            if (trigFail) trigFail.fire()
            return
        }

        setLoginLoader(true)
        if (isHandsUp) isHandsUp.value = false

        fetch(`${process.env.VITE_API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
            credentials: "include", // Ensure cookies are sent with the request
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        console.log(data)

                        throw new Error(`${data.message}`)
                    })
                }
                return response.json()
            })
            .then((data) => {
                setCurrUserAndCookies(data)
                showSuccessMessage(`Hi  ${data.user.name} 👋`)
                if (trigSuccess) trigSuccess.fire()

                setTimeout(() => {
                    window.history.go(-1)
                }, 1000)
            })
            .catch((error) => {
                console.log("error in login : ", error)
                if (trigFail) trigFail.fire()
                showErrorMessage(error.message || "Unknown error")
            })
            .finally(() => {
                setLoginLoader(false)
            })
    }

    return (
        <div className="flex justify-center  ">
            <div className="w-3/4 lg:w-1/2">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
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
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() =>
                                isHandsUp && (isHandsUp.value = true)
                            }
                            onBlur={() =>
                                isHandsUp && (isHandsUp.value = false)
                            }
                        />
                    </div>
                    <button className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        {loginLoader ? <BeatLoader size={10} /> : "Submit"}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    New user?{" "}
                    <Link
                        to="/signup"
                        className="text-indigo-600 hover:underline"
                    >
                        Click here to sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login
