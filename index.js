require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMath = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require('connect-flash');
const Contact = require("./models/contact.js");
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

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallbacksecret',
    resave: false,
    saveUninitialized: false,
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

// Database connection
mongoose.connect(process.env.RUI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'aljamiya' // Explicitly specify database name
})
.then(() => {
    console.log('Connected to aljamiya database!')
})
.catch(err => {
    console.error('MongoDB connection error:')
    console.error(err)
});

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs");
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

// Admin routes
app.get("/admin", (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/messages');
    }
    res.render("admin/login.ejs");
});

app.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (username !== 'admin' || password !== 'aljm2025') {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/admin');
        }

        req.session.userId = 'admin';
        req.session.isAdmin = true;
        
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                req.flash('error', 'Error during login');
                return res.redirect('/admin');
            }
            res.redirect('/admin/messages');
        });
    } catch (e) {
        console.error('Login error:', e);
        req.flash('error', 'Something went wrong!');
        res.redirect('/admin');
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect("/admin");
    });
});

// Admin message management
app.get('/admin/messages', async (req, res) => {
    try {
        if (!req.session.isAdmin) {
            return res.redirect('/admin');
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
        if (!req.session.isAdmin) {
            return res.redirect('/admin');
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

