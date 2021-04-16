const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    name:{
        type: String
    },
    main_admin: {
        type: Boolean,
        default: false
    }
   
});

const Admin = mongoose.model('admin', AdminSchema);
module.exports = Admin;