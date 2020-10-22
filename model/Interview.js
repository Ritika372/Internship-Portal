const mongoose = require('mongoose');
const InterviewSchema = new mongoose.Schema({
    company: {
        type: String
    },
    choice: {
        type: String
    },
    branch: {
        type: String
    },
    rollno: {
        type: String
    },
    exp: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    }
});

const InterviewExp = mongoose.model('experience', InterviewSchema);
module.exports = InterviewExp;