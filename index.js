const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMath = require("ejs-mate");
const methodOverride = require("method-override");
const User = require("./models/users.js");
const { getuid } = require("process");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

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
    await newuser.save();
    res.redirect("/");

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
                res.render("userlogin.ejs",{ rcode });
            }
        }
    } else {
        rcode = "Username not found!";
        res.render("userlogin.ejs",{ rcode });
    }

});

