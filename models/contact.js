const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true,
        enum: [
            'Door',
            'Shifting',
            'Indoor',
            'Kitchen',
            'Outdoor',
            'Paint',
            'Tiles',
            'Gypsum',
            'Other'
        ]
    },
    location: {
        type: String,
        required: true,
        default: 'UAE'
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', contactSchema); 