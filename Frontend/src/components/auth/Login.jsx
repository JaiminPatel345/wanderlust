import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import checkUserSession from "../../utils/auth"

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [flashMessage, setFlashMessage] = useState("") // For displaying error messages
    const navigate = useNavigate()

    // Check if the user is logged in on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await checkUserSession(navigate)
            if (userData) {
                // User is logged in, you can process user data here if needed
                console.log("User is already logged in:", userData)
                navigate(-1)
            }
        }

        fetchUserData()
    }, [navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(JSON.stringify(formData))

        fetch("/api/login", {
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
                        setFlashMessage(data.message)
                        throw new Error(`Login failed ${data.message}`)
                    })
                }
                return response.json()
            })
            .then((data) => {
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        userId: data.user.userId,
                        email: data.user.email,
                        name: data.user.name,
                        expireTime: Date.now() + 1000 * 3600,
                    })
                )
                navigate(-1) // Redirect after successful login
            })
            .catch((error) => {
                console.log("jaimin", error)

                setFlashMessage(error.message) // Display error message
                console.error("Login error:", error)
            })
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-50">
            <div className="w-3/4 lg:w-1/2">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                {flashMessage && (
                    <div
                        className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <span className="block sm:inline">{flashMessage}</span>
                    </div>
                )}
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
                        Submit
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
