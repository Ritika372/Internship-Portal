const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    rollno: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    companies_applied: {
         type:Array,
         default:[]
    },
    password: {
        type: String,
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    degree: {
        type: String
    },
    branch: {
        type: String
    },
    personal_email: {
        type: String
    },
    contact_no: {
        type: String
    },
    cgpa: {
        type: String
    },
    active_backlogs: {
        type: Number
    },
    percent_10:{
        type: Number
    },
    board_10: {
        type: String
    },
    percent_12: {
        type: Number
    },
    board_12: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type:String
    },
    country: {
        type: String
    },
    linkdin: {
        type: String
    },
    grad: {
        type: Number
    },
    confirmed: {
        type: Boolean,
        default: false
    }
    
});

const Student = mongoose.model('student', StudentSchema);
module.exports = Student;