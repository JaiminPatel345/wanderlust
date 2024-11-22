/* eslint-disable react/prop-types */
import { React, createContext, useState } from "react"
import Cookies from "js-cookie"

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [currUser, setCurrUser] = useState(null)

    const setCurrUserAndCookies = (data) => {
        Cookies.set(
            "user",
            JSON.stringify({
                userId: data.user.userId,
                email: data.user.email,
                name: data.user.name,
            }),
            { expires: 1 / 24 }
        )
        setCurrUser(data.user)
    }

    const checkCurrUser = () => {
        if (Cookies.get("user")) {
            const user = JSON.parse(Cookies.get("user"))
            if (user) setCurrUser(user)
        }
    }

    const getCurrUser = () => {
        if (Cookies.get("user")) {
            const user = JSON.parse(Cookies.get("user"))
            return user
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
                logout,
                setCurrUserAndCookies,
                getCurrUser,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
