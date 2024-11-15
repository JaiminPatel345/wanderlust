/* eslint-disable react/prop-types */
import { React, createContext, useState } from "react"
import Cookies from "js-cookie"

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [currUser, setCurrUser] = useState(null)

    const checkCurrUser = () => {
        if (Cookies.get("user")) {
            const user = JSON.parse(Cookies.get("user"))
            if (user) setCurrUser(user)
        }
    }

    const logout = () => {
        Cookies.remove("user")
        setCurrUser(null)
    }

    return (
        <UserContext.Provider
            value={{
                currUser,
                setCurrUser,
                checkCurrUser,
                setCurrUser,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
