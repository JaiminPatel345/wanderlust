import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const history = useNavigate() // For redirecting after login

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Submit the login form
        try {
            // Replace with your login API endpoint
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                // Redirect or update state
                history.push("/dashboard") // Redirect to dashboard after login
            } else {
                // Handle error (display error message)
                console.error("Login failed")
            }
        } catch (error) {
            console.error("An error occurred during login:", error)
        }
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-50">
            <div className="w-3/4 lg:w-1/2">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <form
                    onSubmit={handleSubmit}
                    className="needs-validation"
                    noValidate
                >
                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                            value={formData.username}
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
                    <a
                        href="/signup"
                        className="text-indigo-600 hover:underline"
                    >
                        Click here to sign up
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Login
