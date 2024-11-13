import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import MyNavbar from "./components/common/Navbar"
import Footer from "./components/common/Footer"
import FlashMessages from "./components/common/FlashMessages"
import Login from "./components/auth/Login"
import Signup from "./components/auth/Signup"
import {
    Listings,
    EditListing,
    NewListing,
    OneListing,
    Chat,
} from "./pages/Listing/"

// const createBrowserRouter = {routes,  {future: {
//         v7_fetcherPersist: true,
//         v7_normalizeFormMethod: true,
//         v7_partialHydration: true,
//         v7_relativeSplatPath: true,
//         v7_skipActionErrorRevalidation: true,
//       },
//     }

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <MyNavbar /> {/* Now inside the Router */}
                <div className="container mx-auto flex-grow mb-12">
                    <FlashMessages />
                    <Routes>
                        <Route path="/" exact element={<Listings />} />
                        <Route path="/listings" exact element={<Listings />} />
                        <Route
                            path="/listings/:id"
                            exact
                            element={<OneListing />}
                        />
                        <Route path="/listings/new" element={<NewListing />} />
                        <Route
                            path="/listings/:id/edit"
                            exact
                            element={<EditListing />}
                        />
                        <Route path="/login" exact element={<Login />} />
                        <Route path="/signup" exact element={<Signup />} />
                        <Route path="/chat" exact element={<Chat />} />
                    </Routes>
                </div>
                <Footer className="mt-auto" />
            </div>
        </Router>
    )
}

export default App
