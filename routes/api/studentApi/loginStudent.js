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

app.post("/" , (req,res)=>{
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

module.exports = app;