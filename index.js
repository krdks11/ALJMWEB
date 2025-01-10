const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMath = require("ejs-mate");
const methodOverride = require("method-override");
const User = require("./models/users.js");
const session = require("express-session");
const flash = require("connect-flash");
require("dotenv").config();
const app = express();

const sessionOptions = {
    secret: "codesohail@unique",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(session(sessionOptions));
app.use(flash());

app.engine("ejs", ejsMath);

main().then((res) => {
    console.log("connected to database");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(process.env.RUI)
}


app.listen(3000, () => {
    console.log("Listening on port 3000...");
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("failure");
    next();
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/user", async (req, res) => {
    const { fname, lname, uname, pass, email, country, state, city } = req.body;

    const newuser = await new User({
        fname: fname,
        lname: lname,
        uname: uname,
        pass: pass,
        email: email,
        country: country,
        state: state,
        city: city
    });

    console.log(newuser);
    await newuser.save().then((res) => {
        req.flash("success", "Account Successfully Created!");
    }).catch((err) => {
        req.flash("failure", err);
    });

    res.redirect("/login");

});

app.get("/login", (req, res) => {
    const rcode = ""; // Define ls here with an appropriate value
    res.render("userlogin.ejs", { rcode }); // Pass ls as an object property
});


app.get("/new", (req, res) => {
    res.render("registeruser.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.post("/login", async (req, res) => {
    const { uname, pass } = req.body;
    let rcode;
    const getUser = await User.find({ uname: uname });
    if (getUser.length != 0) {
        if (uname == getUser[0].uname) {
            if (pass == getUser[0].pass) {
                console.log("Login success");
                res.redirect("/");
            }
            else {
                rcode = "Wrong password!";
                res.render("userlogin.ejs", { rcode });
            }
        }
    } else {
        rcode = "Username not found!";
        res.render("userlogin.ejs", { rcode });
    }

});

