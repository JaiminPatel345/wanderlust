const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const {
    Server
} = require("socket.io")
const http = require("http")
const app = express()
const server = http.createServer(app)
const helmet = require("helmet")

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
const session = require("express-session")
const redisStore = require("./redis")

const listingsRoutes = require("./routes/listing.js")
const reviewsRoutes = require("./routes/review.js")
const usersRoutes = require("./routes/user.js")
const chatsRoutes = require("./routes/chat.js")
const port = process.env.PORT || 3000

// Database connection
main()
    .then(() => console.log(`Connection successful. port : ${port}`))
    .catch((err) => console.log(err))

async function main() {
    await mongoose.connect(process.env.MONGO_URL)
}

app.use(helmet())
app.use(express.json())
app.set("trust proxy", 1);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// CORS setup for frontend-backend communication
app.use(
    cors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        exposedHeaders: ["set-cookie"],
    })
)

app.use(
    session({
        store: redisStore,
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET,
        name: "sessionId", // Custom name instead of 'connect.sid'
        cookie: {
            secure: process.env.NODE_ENV == "production",
            maxAge: 1000 * 3600 * 2, //2 H
            SameSite: process.env.SAME_SITE,
            httpOnly: true, // Added security
            domain: process.env.NODE_ENV === "production" ? ".azurewebsites.net" : ".localhost",
        },
    })
)





// app.use(cors({ origin: "*", credentials: true }))

// Socket.io configuration
// const io = new Server(server, {
//     cors: {
//         origin:
//             process.env.NODE_ENV === "production"
//                 ? [
//                       process.env.REACT_APP_API_URL,
//                       "https://wanderlust-git-react-gdgc-bvm.vercel.app",
//                       "https://wanderlust-ten.vercel.app",
//                       "http://localhost:5173/",
//                   ]
//                 : ["http://localhost:5173"],
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         credentials: true,
//     },
// })

// API routes
app.use((req, res, next) => {
    if (req.path === "/") {
        req.url = "/listings"
    }
    next()
})
app.use("/listings/:id/reviews", reviewsRoutes)
app.use("/listings", listingsRoutes)
app.use("/chats", chatsRoutes)
app.use("/", usersRoutes)

// Socket.io for chat
// io.on("connection", (socket) => {
//     socket.on("chat message", (data) => {
//         socket.broadcast.emit(
//             "chat message",
//             `${data.username}  : ${data.message}`
//         )
//     })
// })

app.use((err, req, res, next) => {
    console.log(err)
    if (res.headersSent) {
        return // If headers are already sent, delegate to the default error handler
    }
    res.status(err.statusCode || 500).json({
        message: err.message
    })
})

// Start server
app.listen(port, () => console.log(`Listening on port ${port}`))