import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import requestIp from "request-ip";
import passport from "./config/passport.js";

import router from "./routes.js";
import authRouter from "./authRouter.js";

dotenv.config();

const app = express();

// ==================================================
// 1. BODY PARSER
// ==================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());


// ==================================================
// 2. COOKIE PARSER
// ==================================================

app.use(cookieParser());


// ==================================================
// 3. STATIC FILES
// ==================================================

app.use(express.static("public"));


// ==================================================
// 4. VIEW ENGINE
// ==================================================

app.set("view engine", "ejs");


// ==================================================
// 5. SESSION
// ==================================================

app.use(
    session({
        secret: process.env.SESSION_SECRET_CONNECT_FLASH,
        resave: false,
        saveUninitialized: false
    })
);


// ==================================================
// 6. PASSPORT INITIALIZE
// ==================================================

app.use(passport.initialize());


// ==================================================
// 7. PASSPORT SESSION
// ==================================================

app.use(passport.session());


// ==================================================
// 8. FLASH MESSAGE
// ==================================================

app.use(flash());


// ==================================================
// 9. REQUEST IP
// ==================================================

app.use(requestIp.mw());


// ==================================================
// 10. ROUTES
// ==================================================

app.use("/", authRouter);

app.use("/", router);


// ==================================================
// 11. 404
// ==================================================

app.use((req, res) => {
    res.status(404).send("404 Page Not Found");
});


// ==================================================
// 12. SERVER
// ==================================================

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
    console.log(
        `🚀 Server running http://localhost:${PORT}`
    );
});