import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCompass, faBars } from "@fortawesome/free-solid-svg-icons"
import checkUserSession from "../../utils/auth"
import Logout from "../../utils/logout"
import {
    Navbar,
    Collapse,
    Typography,
    Button,
    IconButton,
    Card,
} from "@material-tailwind/react"
import Cookies from "js-cookie"

// eslint-disable-next-line react/prop-types
const MyNavbar = () => {
    const navigate = useNavigate()
    const [currUser, setCurrUser] = useState(null)
    const [openNav, setOpenNav] = React.useState(false)

    useEffect(() => {
        window.addEventListener(
            "resize",
            () => window.innerWidth >= 960 && setOpenNav(false)
        )

        const fetchUserData = async () => {
            const userData = await checkUserSession(navigate)

            if (userData) {
                // User is logged in, you can process user data here if needed
                setCurrUser(userData)
            }
        }

        fetchUserData()
    }, [navigate])

    const handelLogout = () => {
        Logout()
        setCurrUser(null)
        Cookies.remove("user")
    }

    const handelLogin = () => {
        navigate("/login")
    }

    const handelSignup = () => {
        navigate("/signup")
    }

    const navList = (
        <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
            <Typography
                as="li"
                variant="small"
                color="blue-gray"
                className="p-1 font-normal"
            >
                <Link to="/listings/new" className="flex items-center">
                    List your property
                </Link>
            </Typography>
            <Typography
                as="li"
                variant="small"
                color="blue-gray"
                className="p-1 font-normal"
            >
                {/* //To be Added */}
                <Link to="/" className="flex items-center text-gray-400">
                    chats
                </Link>
            </Typography>
        </ul>
    )

    return (
        <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4 text-black mb-12">
            <div className="flex items-center justify-between text-blue-gray-900">
                <div>
                    <Link
                        to="/"
                        className="mr-4 cursor-pointer py-1.5 font-medium flex gap-3 items-center"
                    >
                        <FontAwesomeIcon
                            className="text-rose-500 h-6"
                            icon={faCompass}
                        />
                        <p className="hidden lg:block">Explore</p>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    {/* <div className="flex w-20 space-x-2">
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
                    </div> */}
                    <div className="mr-4 hidden lg:block">{navList}</div>

                    <div>
                        {!currUser && (
                            <div className="flex  gap-x-1">
                                <Button
                                    variant="gradient"
                                    size="sm"
                                    className="hidden lg:block text-black"
                                    onClick={handelLogin}
                                >
                                    <span>Log In</span>
                                </Button>
                                <Button
                                    variant="gradient"
                                    size="sm"
                                    className="hidden lg:inline-block text-black"
                                    onClick={handelSignup}
                                >
                                    <span>Sign in</span>
                                </Button>
                            </div>
                        )}

                        {currUser && (
                            <div className="text-black">
                                <Button
                                    variant="gradient"
                                    size="sm"
                                    className="hidden lg:inline-block text-black"
                                    onClick={handelLogout}
                                >
                                    <span>Log out</span>
                                </Button>
                            </div>
                        )}
                    </div>
                    <IconButton
                        variant="text"
                        className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
                        ripple={false}
                        onClick={() => setOpenNav(!openNav)}
                    >
                        {openNav ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        )}
                    </IconButton>
                </div>
            </div>
            <Collapse open={openNav}>
                {navList}
                <div>
                    {!currUser ? (
                        <div className="flex items-center gap-x-1">
                            <Button
                                fullWidth
                                variant="text"
                                size="sm"
                                className="border-2 "
                                onClick={handelLogin}
                            >
                                <span>Log In</span>
                            </Button>

                            <Button
                                fullWidth
                                variant="text"
                                size="sm"
                                className="text-black border-2"
                                onClick={handelSignup}
                            >
                                <span className="">Sign in</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="text-black">
                            <Button
                                fullWidth
                                variant="gradient"
                                size="sm"
                                className=" text-black border-2"
                                onClick={handelLogout}
                            >
                                <span>Log out</span>
                            </Button>
                        </div>
                    )}
                </div>
            </Collapse>
        </Navbar>
    )
}

export default MyNavbar
