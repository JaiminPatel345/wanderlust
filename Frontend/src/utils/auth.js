import Cookies from "js-cookie"

const checkUserSession = () => {
    try {
        if (Cookies.get("user")) {
            const user = JSON.parse(Cookies.get("user"))

            return user
        }
    } catch (e) {
        return null
    }

}

export default checkUserSession