const User = require("../models/user.js");
const firebase = require("../utilities/firebase.js");

// User signup
module.exports.signup = (req, res) => {
    const {
        email,
        password,
        name
    } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            message: "Email and password are required",
        });
    }

    const newUser = new User({
        email,
        name,
    });

    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
            return newUser.save();
        })
        .then((savedUser) => {
            const data = {
                userId: savedUser._id,
                email: newUser.email,
                name: newUser.name,
            };
            req.session.user = {
                ...data
            };
            res.status(201).json({
                user: data
            });
        })
        .catch((error) => {
            let message = "An error occurred during signup.";
            switch (error.code) {
                case "auth/email-already-in-use":
                    message = "Email already in use.";
                    break;
                case "auth/invalid-email":
                    message = "Invalid email address.";
                    break;
                case "auth/invalid-password":
                    message = "Password should be at least 6 characters.";
                    break;
                case "auth/uid-already-exists":
                    message = "The provided user ID is already in use.";
                    break;
                default:
                    console.error("Signup error:", error);
            }
            res.status(message === "An error occurred during signup." ? 500 : 403).json({
                success: false,
                message,
                error,
            });
        });
};

// User login
module.exports.login = (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            message: "Email and password are required",
        });
    }

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
            return User.findOne({
                email
            });
        })
        .then((mongoUser) => {
            const data = {
                email,
                name: mongoUser?.name,
                userId: mongoUser?._id,
            };
            req.session.user = {
                ...data
            };
            req.session.save((err) => {
                if (err) {
                    console.error("Error saving session:", err);
                } else {
                    console.log("Session saved successfully");
                }
            });
            return res.status(200).json({
                user: data
            });
        })
        .catch((error) => {
            let message = "An error occurred during login.";
            switch (error.code) {
                case "auth/user-not-found":
                    message = "User not found.";
                    break;
                case "auth/wrong-password":
                    message = "Incorrect password.";
                    break;
                case "auth/invalid-credential":
                    message = "Email or Password is invalid.";
                    break;
                case "auth/id-token-expired":
                    message = "Your session has expired. Please log in again.";
                    break;
                case "auth/invalid-email":
                    message = "Email is Invalid";
                    break;
                case "auth/too-many-requests":
                    message = "Too many requests , wait some time";
                    break;
                default:
                    console.error("Login error:", error);
            }
            res.status(401).json({
                success: false,
                message,
                error
            });
        });
};

// User logout
module.exports.logout = (req, res) => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            console.log("User logged out from Firebase");
            return new Promise((resolve, reject) => {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("Session destroy failed:", err);
                        reject(err);
                    } else {
                        res.clearCookie("sessionId");
                        resolve();
                    }
                });
            });
        })
        .then(() => {
            res.status(200).json({
                message: "Logged out successfully"
            });
        })
        .catch((error) => {
            console.error("Error during Firebase sign-out:", error);
            res.status(500).json({
                message: "Error during logout",
                error: error.message,
            });
        });
};

// Check if user is logged in
module.exports.isLogin = (req, res) => {
    res.send(req.session.user);
};