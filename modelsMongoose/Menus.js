const mongoose = require('mongoose');
const MenusSchema = new mongoose.Schema({
    hak_akses: {
        type: String,
        unique: true
    },
}, { strict: false, timestamps: true });
module.exports = mongoose.model('Menus', MenusSchema);