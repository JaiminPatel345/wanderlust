const User = require('../models/user.js');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = require("firebase/auth");
const firebase = require('../utilities/firebase.js');

// User signup
module.exports.signup = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(422).json({
            email: "email is required",
            password: "password is required",
        });
    }
    const newUser = new User({
        email: req.body.email,
        name: req.body.name,
    });

    // Firebase + mongoose
    firebase
        .auth()
        .createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then((userCredential) => {
            const firebaseUser = userCredential.user;

            return updateProfile(firebaseUser, {
                displayName: req.body.name,
            });
        })
        .then(() => newUser.save())
        .then(savedUser => {
            req.session.userId = savedUser._id; // Store MongoDB _id in session
            const data = {
                userId: savedUser._id, // Use MongoDB _id
                email: newUser.email,
                name: newUser.name,
            };
            res.status(201).json({ success: true, user: data });
        })
        .catch(err => {
            console.log('Jaimin : ' + err);
            res.status(500).json({ success: false, message: err.message });
        });
};

// User login
module.exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({
            email: "email is required",
            password: "password is required",
        });
    }
    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const firebaseUser = userCredential.user;
            const data = {
                userId: firebaseUser.userId,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
            };
            req.session.userId = firebaseUser.userId;
            res.status(200).json({ success: true, user: data });
        })
        .catch((error) => {
            console.log('Jaimin : ' + error);
            res.status(401).json({ success: false, message: error.message });
        });
};

// User logout
module.exports.logout = (req, res) => {

    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log(`user logout `);

    }).catch((error) => {
        // An error happened.
        res.status(500).send(error)
    });

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        return res.status(200).json({ message: 'Logged out successfully' });
    });
};

// Check if user is logged in
module.exports.isLogin = (req, res) => {

    if (req.session.userId) {
        // console.log("Yes");

        return res.status(200).json({ loggedIn: true, userId: req.session.userId });
    } else {
        // console.log("No");
        return res.status(401).json({ loggedIn: false, message: 'User not logged in' });
    }
};
