// src/App.js
// eslint-disable-next-line no-unused-vars
import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import FlashMessages from "./components/FlashMessages"
import Listings from "./pages/Listing/Listings"
import NewListing from "./pages/Listing/NewListing"
import Login from "./pages/User/Login"
import Signup from "./pages/User/Signup"

function App() {
    return (
        <Router>
            {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" /> */}
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="container mx-auto min-h-full mb-48">
                    <FlashMessages />
                    <Routes>
                        <Route path="/listings" exact element={<Listings />} />
                        <Route
                            path="/listings/new"
                            exact
                            element={<NewListing />}
                        />
                        <Route path="/login" exact element={<Login />} />
                        <Route path="/signup" exact element={<Signup />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    )
}

export default App
