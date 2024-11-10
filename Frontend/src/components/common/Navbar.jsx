// src/components/Navbar.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCompass } from "@fortawesome/free-solid-svg-icons"
import checkUserSession from "../../utils/auth"

// eslint-disable-next-line react/prop-types
const Navbar = () => {
    const navigate = useNavigate()
    const [currUser, setCurrUser] = useState(null)

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await checkUserSession(navigate)
            if (userData) {
                // User is logged in, you can process user data here if needed
                setCurrUser(userData)
            }
        }

        fetchUserData()
    }, [navigate])
    return (
        <nav className="bg-gray-100 border-b sticky top-0 z-50 py-4">
            <div className="container mx-auto flex items-center justify-between">
                <a className="text-2xl text-rose-500" href="/">
                    <FontAwesomeIcon icon={faCompass}></FontAwesomeIcon>
                </a>
                <button className="lg:hidden text-gray-700">
                    <span className="fa fa-bars"></span>
                </button>
                <div className="hidden lg:flex space-x-4">
                    <a
                        className="text-gray-700 hover:text-black transition bn3637 bn38 mx-2"
                        href="/listings"
                    >
                        Explore
                    </a>
                </div>
                <div className="hidden lg:flex space-x-4 ml-auto">
                    <div className="flex space-x-2">
                        <input
                            className="form-control p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-white"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                        />
                        <button
                            className="btn bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition"
                            id="search-btn"
                            type="submit"
                        >
                            Search
                        </button>
                    </div>
                </div>
                <div className="hidden lg:flex space-x-4 ml-auto">
                    <a
                        className="rounded-md py-2 px-4 text-center text-sm transition-all text-slate-600 hover:bg-gray-300"
                        href="/listings/new"
                    >
                        List your property
                    </a>
                    <a
                        className="rounded-md py-2 px-4 text-center text-sm transition-all text-slate-600 hover:bg-gray-300"
                        href="/chats"
                    >
                        Chats
                    </a>
                    {!currUser ? (
                        <>
                            <a className="rounded-md py-2 px-4" href="/signup">
                                Sign Up
                            </a>
                            <a className="rounded-md py-2 px-4" href="/login">
                                Log In
                            </a>
                        </>
                    ) : (
                        <a className="rounded-md py-2 px-4" href="/logout">
                            Log Out
                        </a>
                    )}
                </div>
            </div>
        </nav>
    )
}

// Navbar.prototype = {
//     currUser: PropTypes
// }

export default Navbar
