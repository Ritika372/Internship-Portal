const bodyparser = require("body-parser");
const InterviewExp = require('../../../model/Interview');
const express = require('express');
const e = require("express");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));
app.get('/' , (req,res) => {
    res.render("submitExp");
});
app.post('/', (req,res) => {
    let company = req.body.companyname;
    let branch = req.body.branch;
    let exp = req.body.experience;
    let choice = req.body.choice;
    const Experience = new InterviewExp({
        company: company,
        branch: branch,
        exp :exp,
        choice: choice
    });
    Experience.save((err) => {
        if(err){
            console.log(err);
        }
        else{
            res.send("Experience submitted successfully!. Please wait for the admin to confirm.")
        }
    });
});

module.exports = app;