const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    uname: {
        type: String,
        required: true,
        unique: true
    },
    pass: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});

const Aljmuser = mongoose.model("Aljmuser", usersSchema);

module.exports = Aljmuser;