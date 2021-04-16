const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    created_by:{
        type: String
    },
    notice:{
        type: String
    },
    date: {
        type: Date
    }
   
});

const Notice = mongoose.model('notice', NotificationSchema);
module.exports = Notice;