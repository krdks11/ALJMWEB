require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMath = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const Contact = require("./models/contact.js");
const WrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/CustomError.js");
const adminRoutes = require("./routes/admin.js");
const app = express();
const port = process.env.PORT || 3000;

// Basic app setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMath);

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

// Database connection
mongoose.connect(process.env.RUI, {
    dbName: 'aljamiya'
})
.then(() => {
    console.log('Connected to aljamiya database!')
})
.catch(err => {
    console.error('MongoDB connection error:')
    console.error(err)
});

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallbacksecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.RUI,
        dbName: 'aljamiya',
        touchAfter: 24 * 3600 // time period in seconds
    }),
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
};

// Session middleware must come before flash
app.use(session(sessionConfig));
app.use(flash());

// Locals middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use("/admin", adminRoutes);

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.post("/contact", WrapAsync(async (req, res) => {
    const { name, email, service, location, message } = req.body;

    // Server-side validation
    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name is required (minimum 2 characters)');
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Valid email is required');
    if (!service) errors.push('Service type is required');
    if (!location || location.trim().length < 2) errors.push('Location is required');
    if (!message || message.trim().length < 10) errors.push('Message is required (minimum 10 characters)');

    if (errors.length > 0) {
        req.flash('error', errors.join(', '));
        return res.redirect('/contact');
    }

    const newContact = new Contact({
        name: name.trim(),
        email: email.trim(),
        service,
        location: location.trim(),
        message: message.trim()
    });

    await newContact.save();
    req.flash('success', `Thank you for your message. We will get back to you soon regarding your ${service} service request in ${location}.`);
    res.redirect('/contact');
}));

app.get("/about", (req, res) => {
    res.render("about.ejs");
});


app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

