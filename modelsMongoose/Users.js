const mongoose = require('mongoose');
const UsersSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
}, { strict: false, timestamps: true });
module.exports = mongoose.model('Users', UsersSchema);