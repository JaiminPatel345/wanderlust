import React from "react"
import {
    Route,
    Outlet,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from "react-router-dom"
import MyNavbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import Login from "./pages/auth/Login"
import Signup from "./pages/auth/Signup"
import VerifyOTP from "./pages/auth/VerifyOTP"
import ProfileSetup from "./pages/auth/ProfileSetup"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import { Listings, EditListing, NewListing, OneListing } from "./pages/Listing/"
import Dashboard from "./components/Dashboard/Dashboard"
import { FlashMessageProvider } from "./utils/flashMessageContext"
import FlashMessageDisplay from "./components/common/flashMessageDisplay.jsx"
import { Toaster } from "react-hot-toast"
import NotFound from "./pages/NotFound"
import Bookmarks from "./pages/Bookmarks"
import NavigationHandler from "./components/NavigationHandler"

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            <FlashMessageDisplay />
            <NavigationHandler />
            <MyNavbar />
            <div className="container mx-auto flex-grow mb-12">
                <Outlet />
            </div>
            <Footer className="mt-auto" />
        </div>
    )
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<Layout />}>
            <Route path="/" element={<Listings />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<NewListing />} />
            <Route path="/listings/:id" element={<OneListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
        </Route>
    )
)

function App() {
    return (
        <FlashMessageProvider>
            <RouterProvider router={router} />
            <Toaster />
        </FlashMessageProvider>
    )
}

export default App
