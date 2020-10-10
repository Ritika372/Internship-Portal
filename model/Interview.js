const mongoose = require('mongoose');
const InterviewSchema = new mongoose.Schema({
    company: {
        type: String
    },
    branch: {
        type: String
    },
    exp: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: true
    }
});

const InterviewExp = mongoose.model('experience', InterviewSchema);
module.exports = InterviewExp;