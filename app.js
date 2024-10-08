const express = require('express');
const mongoose = require('mongoose');
const RedisStore = require("connect-redis").default
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Swal = require('sweetalert2');
const session = require('express-session')
const flash = require('connect-flash')
const port = 3000;
const app = express();
const passport = require('passport')
const LocalStrategy = require('passport-local')
app.use(require('cookie-parser')())
const { createClient } = require("redis")

// Chat 
const { Server } = require("socket.io");
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

const listingsRoutes = require('./routes/listing.js');
const reviewsRoutes = require('./routes/review.js');
const usersRoutes = require('./routes/user.js');
const chatsRoutes = require('./routes/chat.js');
const { saveOriginalUrl } = require('./utilities/middleware.js')
const User = require('./models/user.js');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.engine('ejs', ejsMate);

main()
  .then(() => console.log(`connection successfully \nYou can view project on http://localhost:${port}`))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}


// Initialize client.
const redisClient = createClient({
  password: process.env.REDIS_PASS,
  socket: {
    host: 'redis-11634.c330.asia-south1-1.gce.redns.redis-cloud.com',
    port: 11634
  }
});

redisClient.connect()
  .then(() => {
    redisClient.ping(); // No arguments needed
  })
  .catch(console.error);



// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
})

// Initialize session storage.
app.use(
  session({
    store: redisStore,
    resave: false, // force lightweight session keep alive (touch)
    saveUninitialized: false, // only save session when data exists
    secret: process.env.SECRET,
    cookie: {
      // Optional: Customize cookie settings as needed
      // secure: true, // use true if using HTTPS
      maxAge: 1000 * 3600 * 24 * 3, // 3 days
    },
  }),
);



app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.currUser = req.user;
  next();
})

app.get("/", saveOriginalUrl, async (req, res) => {
  res.redirect('/listings');
});

app.use('/listings/:id/reviews', reviewsRoutes);
app.use('/listings', listingsRoutes);
app.use('/chats', chatsRoutes);
app.use('/', usersRoutes);


io.on('connection', (socket) => {
  // console.log(`New connection to ${socket.id}`);

  socket.on('chat message', (data) => {

    socket.broadcast.emit("chat message", `${data.username}  : ${data.msg}`);
  });
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  console.log(err);
  if (!err.statusCode) res.status(500).render("./Listings/error.ejs", { Swal, msg: err.message });
  res.status(err.statusCode).render("./Listings/error.ejs", { Swal, msg: err.message });
});

server.listen(port, () => console.log(`listen on port ${port}`));
