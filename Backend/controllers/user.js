const User = require('../models/user.js');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } = require("firebase/auth");
const { auth } = require('../utilities/firebase.js');

// User signup
module.exports.signup = (req, res) => {
    const newUser = new User({
        email: req.body.email,
        name: req.body.name,
    });

    // Firebase + mongoose
    createUserWithEmailAndPassword(auth, req.body.email, req.body.password)
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
                uid: savedUser._id, // Use MongoDB _id
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

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const firebaseUser = userCredential.user;

            // Find user in MongoDB
            return User.findOne({ email }).then(mongoUser => {
                if (!mongoUser) {
                    throw new Error('User not found in database');
                }
                const data = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: mongoUser.name, // Get name from MongoDB
                    _id: mongoUser._id,
                };
                req.session.userId = mongoUser._id; // Store MongoDB _id in session
                res.status(200).json({ success: true, user: data });
            });
        })
        .catch((error) => {
            console.log('Jaimin : ' + error);
            res.status(401).json({
                success: false, message: error.message
            });
        });
};

// User logout
module.exports.logout = (req, res) => {
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
