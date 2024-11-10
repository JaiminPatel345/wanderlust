import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import FlashMessages from "./components/common/FlashMessages"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import { Listings, EditListing, NewListing, OneListing } from "./pages/Listing/"

function App() {
    return (
        <Router>
            {/* <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" /> */}
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="container mx-auto min-h-full mb-48">
                    <FlashMessages />
                    <Routes>
                        <Route path="/" exact element={<Listings />} />
                        <Route path="/listings" exact element={<Listings />} />
                        <Route
                            path="/listings/:id"
                            exact
                            element={<OneListing />}
                        />
                        <Route
                            path="/listings/new"
                            exact
                            element={<NewListing />}
                        />
                        <Route
                            path="/listings/:id/edit"
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
