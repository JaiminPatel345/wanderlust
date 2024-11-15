import React, { useEffect, useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import Cookies from "js-cookie"
import { FlashMessageContext } from "../../utils/flashMessageContext"
import { UserContext } from "../contexts/userContext"

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
    const { currUSer, checkCurrUser } = useContext(UserContext)

    useEffect(() => {
        window.scrollTo(0, 0)
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.email.length == 0 || formData.password.length == 0) {
            showErrorMessage("Email or Password can't be empty ")
            return
        }

        setLoginLoader(true)

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
                console.log(data)

                Cookies.set(
                    "user",
                    JSON.stringify({
                        ...data.user,
                    }),
                    { expires: 1 / 24 }
                )
                checkCurrUser()
                showSuccessMessage(`Hi  ${data.user.name} 👋`)
                window.history.go(-1) // Redirect after successful login
            })
            .catch((error) => {
                console.log("error in login : ", error)
                showErrorMessage(error.message || "Unknown error") // Display error message
            })
            .finally(() => {
                setLoginLoader(false)
            })
    }

    if (currUSer) {
        showWarningMessage("You are already logged in")
        window.history.go("/")
    }

    return (
        <div className="flex justify-center  ">
            <div className="w-3/4 lg:w-1/2">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
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
