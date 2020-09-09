const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Student = require('./model/Student');
const app = express();
const connectdb = require("./config/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

connectdb();

app.get('/' , (req,res) => {
    res.render("opening");
});

app.get('/loginStudent' ,(req,res) => {
    res.render("loginStudent");
});

app.get('/registerStudent' , (req,res) => {
    res.render("registerStudent");
});

//register student.
app.post('/registerStudent' , (req,res) => {
    let email = req.body.studentuser;
    let password = req.body.password;
    let roll = req.body.rollno;
    bcrypt.hash(password ,saltRounds , (err , hash) => {
        const newStudent = new Student({
            rollno : roll,
            email : email,
            password : hash
        });
        newStudent.save((err) => {
            if(err){
                console.log(err);
            }
            else{
                res.send("Registered!");
            }
        });
    });
});

//login student
app.post("/loginStudent" , (req,res)=>{
    let rollno = req.body.rollno;
    let password = req.body.password;
    Student.findOne({rollno : rollno }, (err ,foundStudent) => {
        if(err){
            console.log(err);
        }
        else{
            if(foundStudent){
                bcrypt.compare(password, foundStudent.password , (err,result) => {
                    if(result){
                        res.send("logged in successfully");
                    }
                    else if(err){
                        console.log(err);
                    }
                });
            }
        }
    });
});

app.listen(3000 , () => {
    console.log("Server started on port 3000");
});
