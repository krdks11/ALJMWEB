const router = require("express").Router();
const WrapAsync = require("../utils/WrapAsync.js");
const Contact = require("../models/contact.js");

// Admin routes
router.get("/", (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/messages');
    }
    res.render("admin/login.ejs");
});

router.post("/login", WrapAsync(async (req, res) => {
    const { username, password } = req.body;
    
    if (username !== process.env.ADMIN || password !== process.env.ADMIN_PASSWORD) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/admin');
    }

    req.session.userId = 'admin';
    req.session.isAdmin = true;
    
    await new Promise((resolve, reject) => {
        req.session.save((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    res.redirect('/admin/messages');
}));

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect("/admin");
    });
});

// Admin message management
router.get('/messages', WrapAsync(async (req, res) => {
        if (!req.session.isAdmin) {
            return res.redirect('/admin');
        }
        
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.render('admin/messages', { messages });
}));

router.delete('/messages/:id', WrapAsync(async (req, res) => {
        if (!req.session.isAdmin) {
            return res.redirect('/admin');
        }
        
        await Contact.findByIdAndDelete(req.params.id);
        req.flash('success', 'Message deleted successfully');
        res.redirect('/admin/messages');
}));

module.exports = router;
