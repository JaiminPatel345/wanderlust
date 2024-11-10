
const Logout = () => {
    fetch("/api/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })

}

export default Logout