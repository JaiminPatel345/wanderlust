const Logout = () => {
    fetch(`${process.env.VITE_API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
}

export default Logout
