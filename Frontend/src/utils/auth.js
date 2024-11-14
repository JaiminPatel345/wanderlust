import Cookies from "js-cookie"

const checkUserSession = () => {
    if (Cookies.get("user")) {
        const user = JSON.parse(Cookies.get("user"))

        return user
    }
}

export default checkUserSession
