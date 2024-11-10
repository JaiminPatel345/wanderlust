

const checkUserSession = async () => {
    const user = localStorage.getItem("user");
    return user;
};

export default checkUserSession;
