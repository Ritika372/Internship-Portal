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
    },
    students:{
          type:Array,
          default:[]
    },
    eligible_prog : {
        type: Array,
        default: []
    },
    eligible_branch : {
        type : Array,
        default: []
    },
    min_cgpa : {
        type : String // todo convert float
    },
    min_10_percent : {
        type : String
    },
    min_12_percent : {
        type : String
    },
    medical_requirement : {
        type : String
    },
    // service_agreement : {
    //     type : String
    // },
    // service_agreement_duration : {
    //     type : String
    // },
    // other_eligibility : {
    //     type : String
    // },

    // Package Details
    package : {
        type : Number
    },
    company_accommodation : {
        type : String
    },
    other_facility : {
        type : String
    },
    // Selection Process
    // selection_process : {
    //     type : Object
    // },
    // waitlist : {
    //     type : String
    // },
    // final_offer : {
    //     type : String
    // },

    // registration deadline
    deadline_date : {
        type : Date,
     //   required : true
    }
});

const Company = mongoose.model('company', CompanySchema);
module.exports = Company;