import React, { useContext, useEffect } from "react"
import { FlashMessageContext } from "../utils/flashMessageContext"
import toast, { Toaster } from "react-hot-toast"

const FlashMessageDisplay = () => {
    const { flashMessage, clearFlashMessage } = useContext(FlashMessageContext)

    useEffect(() => {
        if (flashMessage) {
            const { message, type } = flashMessage
            if (type === "success") {
                toast.success(message, {
                    onClose: clearFlashMessage,
                })
            } else if (type === "error") {
                toast.error(message, {
                    onClose: clearFlashMessage,
                })
            } else if (type === "warning") {
                toast.warning(message, {
                    onClose: clearFlashMessage,
                })
            }
        }
    }, [flashMessage, clearFlashMessage])

    return null
}

export default FlashMessageDisplay
