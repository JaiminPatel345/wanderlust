import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import checkUserSession from "../../utils/auth"

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    })

    const [errors, setErrors] = useState({})
    const [flashMessage, setFlashMessage] = useState("") // Flash message state
    const navigate = useNavigate()

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

        setErrors(formErrors)
        return valid
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Clear any previous flash message
        setFlashMessage("")

        if (!validateForm()) {
            setFlashMessage("Please correct the errors in the form.") // Set flash message
            return
        }

        await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Assuming the token is included in the response data
                if (data.success) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            userId: data.user.userId,
                            email: data.user.email,
                            name: data.user.name,
                            mongoose_id: data.user._id,
                        })
                    )
                } else {
                    throw new Error(data.message)
                }
                console.log(data) // Log the response data
                navigate("/listings")
            })
            .catch((error) => {
                setFlashMessage(error.message)
            })
    }

    return (
        <div className="flex justify-center min-h-screen bg-gray-50">
            <div className="w-3/4 lg:w-1/2">
                <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

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
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        Submit
                    </button>
                </form>

                <p className="mt-4 text-center">
                    Already Registered?{" "}
                    <a
                        href="/login"
                        className="text-indigo-600 hover:underline"
                    >
                        Click here to log in
                    </a>
                </p>
            </div>
        </div>
    )
}

export default Signup
