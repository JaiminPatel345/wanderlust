// Get authentication token
export const getToken = () => {
    return localStorage.getItem("token");
};

// Check user session
export const checkUserSession = () => {
    try {
        if (localStorage.getItem("user")) {
            return JSON.parse(localStorage.getItem("user"))
        }
        return null
    } catch (e) {
        return null
    }
}

// Set authentication token
export const setToken = (token) => {
    localStorage.setItem("token", token);
};

// Remove authentication token
export const removeToken = () => {
    localStorage.removeItem("token");
};