require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const PORT = 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo")(session);
// const passport = require('passport')
const passport = require("passport");
const Emitter = require("events");

// Database connection
// mongoose
//   .connect("mongodb://127.0.0.1:27017/pizza")
//   .then(() => {
//     console.log("connected successfully");
//   })
//   .catch(() => {
//     console.log("hello");
//   });

// const url = "mongodb://127.0.0.1:27017/pizza"; 
const connection = mongoose.connection;
mongoose
  .connect(process.env.MONGO_CONNECTION_URL,{ useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true })
  .then(() => {
    console.log("database connected successfully");
  })
  .catch(() => {
    console.log("database connection failed");
  });

// session store
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: "sessions",
});

// Event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

// session configuration for cookie save
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hour
    // cookie: { maxAge: 1000 * 45 }, // time in  second
  })
);

// passport config
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// flash message
app.use(flash());

// assets
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");


//required all routes 
require("./routes/web")(app);
app.use((req, res) => {
  res.status(404).render('errors/404')
})

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//socket

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  //join
  // console.log(socket.id);
  socket.on("join", (orderId) => {
    // console.log(orderId);
    socket.join(orderId);
  });
});

//customer order update emit
eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

//admin new order update emit
eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
