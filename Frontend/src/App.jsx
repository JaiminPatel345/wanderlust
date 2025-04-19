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
import { Listings, EditListing, NewListing, OneListing } from "./pages/Listing/"
import { FlashMessageProvider } from "./utils/flashMessageContext"
import FlashMessageDisplay from "./components/flashMessageDisplay"
import { Toaster } from "react-hot-toast"
import { UserProvider } from "./contexts/userContext"
import Chat from "./pages/Chat"

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden">
            <FlashMessageDisplay />
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
            <Route path="/chats" element={<Chat />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<NewListing />} />
            <Route path="/listings/:id" element={<OneListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
        </Route>
    )
)

function App() {
    return (
        <UserProvider>
            <FlashMessageProvider>
                <RouterProvider router={router} />
                <Toaster />
            </FlashMessageProvider>
        </UserProvider>
    )
}

export default App
