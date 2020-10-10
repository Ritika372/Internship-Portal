const bodyparser = require("body-parser");
const Student = require('../../../model/Student');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/enterdetails' , (req,res) => {
    res.render("enterdetails");
});

let rollno;
app.post('/enterdetails' , (req,res) => {
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
        linkdin: req.body.linkdin,
        grad: req.body.grad
    }}  ,{new: true} ,(err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.redirect('/student/register/studentprofile');
        }
    });
});

app.get('/' , (req,res) => {
    res.render("registerStudent");
});

app.post('/' , (req,res) => {
    let email = req.body.studentuser;
    let password = req.body.password;
    rollno = req.body.rollno;
    bcrypt.hash(password ,saltRounds , (err , hash) => {
        const newStudent = new Student({
            rollno : rollno,
            email : email,
            password : hash
        });
        newStudent.save((err) => {
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/student/register/enterdetails');
            }
        });
    });
});

app.get('/studentprofile' , (req,res) => {
    Student.findOne({rollno: rollno} , (err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            
            res.render("studentprofile" , {firstname : student.firstname , 
                lastname :student.lastname , 
                branch: student.branch, 
                degree : student.degree, 
                personal_email: student.personal_email, 
                grad: student.grad,
                contact_no : student.contact_no,
                cgpa: student.cgpa,
                active_backlogs: student.active_backlogs,
                percent_10: student.percent_10,
                board_10 : student.board_10,
                percent_12: student.percent_12,
                board_12: student.board_12,
                address: student.address,
                city : student.city,
                state: student.state,
                country: student.country,
                linkdin: student.linkdin,
              });
        }
    });
});
module.exports = app;