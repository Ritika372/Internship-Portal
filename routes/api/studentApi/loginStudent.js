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
app.get('/' , (req,res) => {
    res.render("loginStudent");
});

let rollno;

app.post("/" , (req,res)=>{
    rollno = req.body.rollno;
    let password = req.body.password;
    Student.findOne({rollno : rollno }, (err ,foundStudent) => {
        if(err){
            console.log(err);
        }
        else{
            if(foundStudent){
                bcrypt.compare(password, foundStudent.password , (err,result) => {
                    if(result){
                        res.redirect('/api/studentapi/loginStudent/studentprofile');
                    }
                    else if(err){
                        console.log(err);
                    }
                });
            }
        }
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