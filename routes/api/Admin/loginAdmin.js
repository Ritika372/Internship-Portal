const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const Student= require('../../../model/Student');
const Company = require('../../../model/Company');
require('dotenv').config();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/' , (req,res) => {
    res.render('loginAdmin');
});

app.post('/' , (req,res)=> {
    console.log(process.env.EMAIL);
    if(req.body.emailAdmin === process.env.EMAIL && req.body.passAdmin === process.env.PASS){
        res.render('adminHome');
    }
    else{
       // res.redirect("/","true")
        res.json({msg : "Incorrect pass or email"});
    }
});


app.get('/Students/' , (req,res)=> {
    Student.find({},(error,students)=>
               {
                if(error){
                    console.log(error);
                    return res.json({msg: "Something went wrong!"});
                }
                else{
                    res.render("adminStudents" , {
                        students:students
                      });
                }
               })
           }
);

app.get('/Companies/' , (req,res)=> {
    Company.find({},(error,companies)=>
               {
                if(error){
                    console.log(error);
                    return res.json({msg: "Something went wrong!"});
                }
                else{
                    res.render("adminAllCompanies" , {
                        companies:companies
                      });
                }
               })
           }
);

module.exports = app;