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
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import { Listings, EditListing, NewListing, OneListing } from "./pages/Listing/"
import { FlashMessageProvider } from "./utils/flashMessageContext"
import FlashMessageDisplay from "./components/flashMessageDisplay"
import { Toaster } from "react-hot-toast"
import { UserProvider } from "./components/contexts/userContext"
import Chat from "./pages/Chat"

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
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
            <Route path="/chats" element={<Chat />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/new" element={<NewListing />} />
            <Route path="/listings/:id" element={<OneListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
        </Route>
    ),
    {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
            v7_fetcherPersist: true,
            v7_normalizeFormMethod: true,
            v7_partialHydration: true,
            v7_skipActionErrorRevalidation: true,
        },
    }
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
