/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserContext } from "../../contexts/userContext"
import useListingStore from "../../../Store/listing"
import {
    IconCompass,
    IconSearch,
    IconMenu2,
    IconX,
    IconPlus,
    IconMessages,
} from "@tabler/icons-react"

const NavLink = ({ to, children, disabled = false, className = "" }) => (
    <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${disabled ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"} 
      ${className}`}
    >
        {children}
    </Link>
)

const NavButton = ({
    onClick,
    children,
    variant = "primary",
    disabled = false,
}) => {
    const baseStyles =
        "px-4 py-2 rounded-md text-sm font-medium transition-colors"
    const variants = {
        primary:
            "bg-rose-500 text-white hover:bg-rose-600 disabled:bg-rose-300",
        secondary:
            "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
        outline: "border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50",
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} disabled:cursor-not-allowed`}
        >
            {children}
        </button>
    )
}

const SearchBar = ({ value, onChange }) => (
    <div className="flex gap-2 max-w-md w-full">
        <div className="relative flex-1">
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                aria-label="Search listings"
            />
            <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
            />
        </div>
    </div>
)

const Navigation = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { currUser, logout, checkCurrUser } = useContext(UserContext)
    const filterListingOnTyping = useListingStore(
        (state) => state.filterListingOnTyping
    )

    useEffect(() => {
        const handleResize = () => window.innerWidth >= 768 && setIsOpen(false)
        window.addEventListener("resize", handleResize)
        checkCurrUser()

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        setSearchQuery("")
        setIsOpen(false)
    }, [location.pathname])

    useEffect(() => {
        filterListingOnTyping(searchQuery)
    }, [searchQuery])

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    const mobileMenuButton = (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle menu"
        >
            {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
    )

    const navigationLinks = (
        <div className={`${isOpen ? "block" : "hidden"} md:block`}>
            <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <NavLink to="/listings/new" className="flex items-center gap-2">
                    <IconPlus size={20} />
                    Add Listing
                </NavLink>
                <NavLink to="/chats" className="flex items-center gap-2">
                    <IconMessages size={20} />
                    Chats
                </NavLink>
            </div>
        </div>
    )

    const authButtons = (
        <div className={`${isOpen ? "block" : "hidden"} md:block mt-4 md:mt-0`}>
            <div className="flex flex-col md:flex-row gap-2">
                {currUser ? (
                    <NavButton onClick={handleLogout} variant="outline">
                        Log out
                    </NavButton>
                ) : (
                    <>
                        <NavButton
                            onClick={() => navigate("/login")}
                            variant="outline"
                        >
                            Log in
                        </NavButton>
                        <NavButton
                            onClick={() => navigate("/signup")}
                            variant="primary"
                        >
                            Sign up
                        </NavButton>
                    </>
                )}
            </div>
        </div>
    )

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                        <IconCompass size={28} />
                        <span className="hidden md:block font-medium">
                            Explore
                        </span>
                    </Link>

                    {/* Search Bar - Hidden on mobile, shown on larger screens */}
                    <div className="hidden md:block flex-1 max-w-2xl mx-4">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                    </div>

                    {/* Navigation Links & Auth Buttons - Hidden on mobile */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        {navigationLinks}
                        {authButtons}
                    </div>

                    {/* Mobile menu button */}
                    {mobileMenuButton}
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden py-2">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>

                {/* Mobile Navigation Links & Auth Buttons */}
                <div
                    className={`md:hidden pb-4 ${isOpen ? "block" : "hidden"}`}
                >
                    {navigationLinks}
                    {authButtons}
                </div>
            </div>
        </nav>
    )
}

export default Navigation
