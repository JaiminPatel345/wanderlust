// src/components/Footer.js
// eslint-disable-next-line no-unused-vars
import React from "react"

const Footer = () => {
    return (
        <footer className="w-full mt-5 bg-gray-100 py-8 h-full">
            <div className="text-center">
                <div className="flex justify-center space-x-6 mb-4">
                    <a
                        href="https://github.com/JaiminPatel345/wanderlust"
                        className="text-gray-500 hover:text-pink-500"
                    >
                        <i className="fa-brands fa-facebook-f"></i>
                    </a>
                    <a
                        href="https://github.com/JaiminPatel345/wanderlust"
                        className="text-gray-500 hover:text-pink-500"
                    >
                        <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a
                        href="https://github.com/JaiminPatel345/wanderlust"
                        className="text-gray-500 hover:text-pink-500"
                    >
                        <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                </div>
                <div>&copy; Wanderlust private limited - Jaimin Detroja</div>
                <div className="flex justify-center space-x-6 mt-4 text-gray-500">
                    <a href="#" className="hover:underline">
                        Privacy
                    </a>
                    <a href="#" className="hover:underline">
                        Terms
                    </a>
                    <a href="https://github.com/JaiminPatel345/wanderlust">
                        <i className="fa-brands fa-github"></i>
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer
