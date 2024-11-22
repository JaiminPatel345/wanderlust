/* eslint-disable react/prop-types */
import { React, createContext, useState } from "react"
import Cookies from "js-cookie"
import CryptoJS from "crypto-js"

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [currUser, setCurrUser] = useState(null)

    const encryptData = (data) => {
        try {
            return CryptoJS.AES.encrypt(
                JSON.stringify(data),
                process.env.SECRET_KEY || "asdasdasd#$@#$@#SDFdsfsdSDF$%435"
            ).toString()
        } catch (error) {
            console.error("Encryption Error:", error)
            return null
        }
    }

    // Decrypt data when reading from cookie
    const decryptData = (encryptedData) => {
        try {
            const bytes = CryptoJS.AES.decrypt(
                encryptedData,
                process.env.SECRET_KEY || "asdasdasd#$@#$@#SDFdsfsdSDF$%435"
            )
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
            return JSON.parse(decryptedData)
        } catch (error) {
            console.error("Decryption Error:", error)
            return null
        }
    }

    const setCurrUserAndCookies = (data) => {
        const encryptedUser = encryptData({
            userId: data.user.userId,
            email: data.user.email,
            name: data.user.name,
        })

        if (encryptedUser) {
            Cookies.set("user", encryptedUser, {
                expires: 1, // 1 day
            })
            setCurrUser({
                userId: data.user.userId,
                email: data.user.email,
                name: data.user.name,
            })
            return true
        } else {
            return false
        }
    }

    const checkCurrUser = () => {
        const userCookie = Cookies.get("user")
        if (userCookie) {
            const decryptedUser = decryptData(userCookie)
            if (decryptedUser) {
                setCurrUser(decryptedUser)
                return true
            }
        }
        return false
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
            }}
        >
            {children}
        </UserContext.Provider>
    )
}
