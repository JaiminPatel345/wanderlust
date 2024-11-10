

const checkUserSession = async () => {
    try {
        const response = await fetch("/api/islogin", {
            method: "GET",
            credentials: "include", // Include cookies in the request
        });

        if (response.ok) {
            const data = await response.json();
            if (data.loggedIn) {
                return data; // Return the user data if needed
            }
        } else {
            console.error("User is not logged in.");
        }
    } catch (error) {
        console.error("Failed to check session:", error);
    }

    return null; // Return null if the user is not logged in or an error occurred
};

export default checkUserSession;
