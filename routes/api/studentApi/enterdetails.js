const bodyparser = require("body-parser");
const Student = require('../../../model/Student');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/api/studentapi/enterdetails.js' , (req,res) => {
    res.render("enterdetails");
});

app.post('/api/studentapi/enterdetails.js' , (req,res) => {
    Student.findOneAndUpdate({rollno : req.body.college_id} , {$set : {
        firstname : req.body.firstname , 
        lastname :req.body.lastname,
        degree: req.body.degree,
        branch: req.body.branch,
        personal_email: req.body.personal_email,
        contact_no : req.body.contact_no,
        cgpa: req.body.cgpa,
        active_backlogs: req.body.active_backlogs,
        percent_10: req.body.percent_10,
        board_10 : req.body.board_10,
        percent_12: req.body.percent_12,
        board_12: req.body.board_12,
        address: req.body.address,
        city : req.body.city,
        state: req.body.state,
        country: req.body.country,
        linkdin: req.body.linkdin
    }}  ,{new: true} ,(err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.render("studentprofile");
        }
    });
});