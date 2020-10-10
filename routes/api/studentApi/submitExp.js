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
    res.send("Welcome to exp");
});
app.post('/', (req,res) => {
    let company = req.body.company;
    let branch = req.body.branch;
    let exp = req.body.exp;
    const Experience = new InterviewExp({
        company: company,
        branch: branch
    });
    Experience.save((err) => {
        if(err){
            console.log(err);
        }
        else{
            res.send("Success");
        }
    });
});

module.exports = app;