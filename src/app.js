const express = require("express");
const app = express();
const productsRouter = require("./routes/products.router.js")
const cartsRouter = require ("./routes/carts.router.js")
const sessionsRouter = require("./routes/sessions.router.js")
const PORT = 8080;
const viewsRouter = require("./routes/views.router.js");

//Socket IO
const socket = require("socket.io");

//Session
const session = require("express-session");

//Mongo-Connect
const MongoStore = require("connect-mongo");

//File-Store
const FileStore = require ("session-file-store");
const fileStore = FileStore(session);

//import MongoDB
require ("./database.js");

//Express-Handlebars
const exphbs = require("express-handlebars")

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static("./src/public"));

//Middleware de session
app.use(session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
    //Mongo Store
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://leonardokim92:coderhouse@cluster0.2ca8jnw.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=Cluster0", ttl: 100
    })
}))

//Routes
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionsRouter);

//Socket IO & CHAT
const httpServer = app.listen(PORT, () => {
    console.log(`Listening in PORT ${PORT}`);
})

const MessageModel = require("./models/message.model.js");
const io = new socket.Server(httpServer);

io.on("connection", (socket) => {
    console.log("A client had connected");

    socket.on("message", async (data) => {
        
        await MessageModel.create(data);

        const messages = await MessageModel.find();
        io.sockets.emit("message", messages)  
    })
} )

//Session
// app.get("/session", (req, res) => {
//     if(req.session.counter){
//         req.session.counter++;
//         res.send("You visited this site: " + req.session.counter + "times")
//     } else {
//         req.session.counter = 1;
//         res.send("Welcome! Join US!")
//     }
// })

// //Logout
// app.get("/logout", (req, res) => {
//     req.session.destroy ((error) => {
//         if(!error) res.send("Session closed");
//         else res.send("We have an error")
//     })
// })

// //Login con session:
// app.get("/login", (req, res) => {
//     let {user, pass} =req.query;
//     if(user === "tinki" && pass === "winki" ) {
//         req.session.user = user;
//         req.session.admin = true,
//         res.send("log in succesfully")
//     } else {
//         res.send ("Incorrect Info")
//     }
// })

// //Autentication Middleware
// function auth(req, res, next) {
//     if(req.session.admin === true) {
//         return next();
//     }
//     return res.status (403).send ("Autorizacion error");
// }

// //Ruta privada con login:
// app.get("/private", auth, (req, res) => {
//     res.send("You are the admin")
// })


