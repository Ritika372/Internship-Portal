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
    res.render("registerStudent");
});

app.post('/' , (req,res) => {
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
module.exports = app;