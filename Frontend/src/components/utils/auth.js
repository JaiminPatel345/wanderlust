

const checkUserSession = async (navigate) => {
    try {
        const response = await fetch("/api/islogin", {
            method: "GET",
            credentials: "include", // Include cookies in the request
        });

        if (response.ok) {
            const data = await response.json();
            if (data.loggedIn) {
                console.log("User is logged in:", data.userId); // You can log the user ID or other data
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
