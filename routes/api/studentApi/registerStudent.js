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
//Renders the starting register page
app.get('/' , (req,res) => {
    res.render("registerStudent");
});
//Saving the initial data of the user
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
        newStudent.save((err,result) => {
            if(err){
                console.log(err);
            }
            else{
                console.log(newStudent._id);
                res.redirect('/student/register/'+newStudent._id+'/enterdetails');
            }
        });
    });
});

//Renders the enterdetails page with the email rollno according to saved data
app.get('/:id/enterdetails' , (req,res) => {
    console.log(req.params.id);
    //link given the direction so that post button works
    const link="/student/register/"+req.params.id+"/enterdetails";
    console.log(link);
    Student.findById({_id : req.params.id}, (err,student) => {
        if(err)
        {
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.render("enterdetails" , {
                link:link,
                email: student.email,
                rollno: rollno     
              });
        }
    });
});
    

//saves the data of the user
app.post('/:id/enterdetails' , (req,res) => {
 
    Student.findByIdAndUpdate({_id : req.params.id} , {$set : {
        firstname : req.body.firstname , 
        lastname :req.body.lastname,
        personal_email:req.body.personal_email,
        degree: req.body.degree,
        branch: req.body.branch,
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
            //redirects to student profile
            res.redirect('/student/login/'+req.params.id+'/studentprofile');
        }
    });
});


module.exports = app;