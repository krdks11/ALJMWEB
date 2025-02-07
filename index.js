const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMath = require("ejs-mate");
const methodOverride = require("method-override");
const Aljmuser = require("./models/users.js");
const session = require("express-session");
const flash = require('connect-flash');
const bcrypt = require("bcrypt");
const Contact = require("./models/contact.js");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallbacksecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));
app.use(session(sessionConfig));
app.use(flash());

app.engine("ejs", ejsMath);

mongoose.connect(process.env.RUI)
    .then(() => {
        console.log('Database Connected!')
    })
    .catch(err => {
        console.log('MongoDB connection error:')
        console.log(err)
    });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    res.locals.username = req.session.username;
    res.locals.isAdmin = req.session.username === 'code';
    res.locals.success = req.flash('success');
    res.locals.failure = req.flash('failure');
    res.locals.error = req.flash('error');
    next();
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/user", async (req, res) => {
    try {
        const { fname, lname, uname, pass, email } = req.body;
        
        const existingUser = await Aljmuser.findOne({ 
            $or: [{ email }, { uname }] 
        });
        
        if (existingUser) {
            req.flash('failure', "Username or email already exists");
            return res.redirect("/new");
        }

        const hashedPassword = await bcrypt.hash(pass, 12);

        const newuser = new Aljmuser({
            fname,
            lname,
            uname,
            pass: hashedPassword,
            email
        });

        await newuser.save();
        req.flash('success', "Account Successfully Created!");
        res.redirect("/login");
    } catch (err) {
        console.error(err);
        req.flash('failure', "Error creating account");
        res.redirect("/new");
    }
});

app.get("/login", (req, res) => {
    res.render("userlogin.ejs", { rcode: null });
});


app.get("/new", (req, res) => {
    res.render("registeruser.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.post("/contact", async (req, res) => {
    try {
        const { name, email, service, location, message } = req.body;
        
        const newContact = new Contact({
            name,
            email,
            service,
            location,
            message
        });

        await newContact.save();
        req.flash('success', `Thank you for your message. We will get back to you soon regarding your ${service} service request in ${location}.`);
        res.redirect('/contact');
    } catch (err) {
        console.error(err);
        req.flash('error', 'There was an error sending your message. Please try again.');
        res.redirect('/contact');
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.post("/login", async (req, res) => {
    try {
        const { uname, pass } = req.body;
        const user = await Aljmuser.findOne({ uname });
        
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }
        
        const isValid = await bcrypt.compare(pass, user.pass);
        if (!isValid) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }

        req.session.userId = user._id;
        req.session.username = user.uname;
        res.redirect('/');
    } catch (e) {
        console.error(e);
        req.flash('error', 'Something went wrong!');
        res.redirect('/login');
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.get('/admin/messages', async (req, res) => {
    try {
        if (!req.session.userId) {
            req.flash('error', 'Please login first');
            return res.redirect('/login');
        }
        
        if (req.session.username !== 'code') {
            req.flash('error', 'Access denied');
            return res.redirect('/');
        }
        
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.render('admin/messages', { messages });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error loading messages');
        res.redirect('/');
    }
});

app.delete('/admin/messages/:id', async (req, res) => {
    try {
        if (!req.session.userId || req.session.username !== 'code') {
            req.flash('error', 'Access denied');
            return res.redirect('/');
        }
        
        await Contact.findByIdAndDelete(req.params.id);
        req.flash('success', 'Message deleted successfully');
        res.redirect('/admin/messages');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error deleting message');
        res.redirect('/admin/messages');
    }
});

