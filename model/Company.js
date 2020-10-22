const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    companyname:{
        type: String
    },
    website: {
        type: String
    },
    org_type:{
        type: String
    },
    industry_sector:{
        type: String
    },
    about_company:{
        type: String
    },
    job_profile:{
        type: String
    },
    batch:{
        type: String
    },
    recruitment:{
        type: String
    },
    duration:{
        type: String
    },
    location:{
        type: String
    },
    date: {
        type: String
    },
    description: {
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    confirmedbyAdmin: {
        type: Boolean,
        default: false
    }
});

const Company = mongoose.model('company', CompanySchema);
module.exports = Company;