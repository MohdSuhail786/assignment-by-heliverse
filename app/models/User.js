const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
});
userschema.index({email: 'text'});

module.exports = mongoose.model("User",userschema);