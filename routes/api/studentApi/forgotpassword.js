const bodyparser = require("body-parser");
const Student = require('../../../model/Student');
const cookieParser=require("cookie-parser");
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const sendemails=require('./email');
const saltRounds = 10;
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(express.static("public"));
/*page rendered for getting rollno */
app.get('/' , (req,res) => {
    res.render("forgotpass");
});

app.post("/" , (req,res)=>{
    let rollno = req.body.rollno;
     Student.findOne({rollno : rollno }, (err ,foundStudent) => {
         if(err){
             res.send("Something Wrong Happened");
             console.log(err);
         }
         else{
             if(foundStudent){
                const expiration =  604800000;
                const id=foundStudent._id;
               const token = jwt.sign({id,rollno }, "rohitMittalisthebest", {
                expiresIn:  '7d',
                });
                const msg ="Please Click on the given button to Change the password";
                const link ="http://localhost:3000/student/forgot_pass/check/"+token; 
                  sendemails(foundStudent.email,link,msg);
                 res.send("Check your mail");
            }
             else{
                 res.send("First Register yourself");
             }
         }
     });
 });
 
 const verify =async(req,res) =>{

    const token=req.params.token||"";
    console.log(token );
    const password=req.body.password;
    try{
        if(!token)
        {
            return res.send("Wrong Link ");
        }
        const decrypt = await jwt.verify(token,  "rohitMittalisthebest");
        bcrypt.hash(password ,saltRounds , (err , hash) => {
            if(err)
            return res.send("Wrong token");
        Student.findByIdAndUpdate({_id : decrypt.id}, {
            $set : 
            { password : hash}}, {new: true} ,(error,student) => {
                if(error){
                    return res.json({msg: "Something went wrong!"});
                }
                else{
                    return res.json({msg: "Password Changed!"});
                }
            
        });
        
    
    });
    } catch(error)
    {
        console.log(error);
        res.json({msg: "Something went wrong!"});
    }
   
    };

app.post("/check/:token",verify);

 app.get('/check/:token' , (req,res) => {
    res.render("getnewpass",{link:"http://localhost:3000/student/forgot_pass/check/"+req.params.token});
});
module.exports = app;