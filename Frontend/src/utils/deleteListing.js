import Cookies from "js-cookie"

const DeleteListing = (id) => {
    fetch(`${process.env.VITE_API_BASE_URL}/listings/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            'Cookie': `sessionId=${Cookies.get('sessionId')}`

        },
        credentials: "include",
    }).catch((error) => {
        console.log(error)
    })
}

export default DeleteListing
