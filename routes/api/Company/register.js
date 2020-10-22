const bodyparser = require("body-parser");
const Company = require('../../../model/Company');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const cookieParser=require("cookie-parser");
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(express.static("public"));

//Renders the starting register page
app.get('/' , (req,res) => {
    res.render("registerComp");
});
//Saving the initial data of the company
app.post('/' , (req,res) => {
    let email = req.body.email;
    let password = req.body.password;
    let companyname = req.body.companyname;
    bcrypt.hash(password ,saltRounds , (err , hash) => {
        const newCompany = new Company({
            companyname : companyname,
            email : email,
            password : hash
        });
        newCompany.save((err,res) => {
            if(err){
                console.log(err);
            }
            else{
                generateToken(res,newCompany._id);
                res.redirect('/company/register/'+newCompany._id+'/enterdetails');
            }
        });
    });
});

const verifyToken = async (req, res, next) => {
    const token = req.cookies['CompanyLogin']|| '';
    try {
      if (!token) {
        return res.redirect('/company/login');
      }
      const decrypt = await jwt.verify(token,  "rohitMittalisthebest");
      if(decrypt.id === req.params.id)
      {
          next();
      }
      else
      {
          console.log("in else");
        return res.redirect('/company/login');  
      }
    } catch (err) {
        console.log(err);
        return res.redirect('/company/login');
    }
  };


app.use("/:id",verifyToken);





//Renders the enterdetails page with the email rollno according to saved data
app.get('/:id/enterdetails' , (req,res) => {
    //link given the direction so that post button works
    const link="/company/register/"+req.params.id+"/enterdetails";
    Company.findById({_id : req.params.id}, (err,company) => {
        if(err)
        {
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.render("enterdetailsComp" , {
                link:link,
                companyname: company.companyname
              });
        }
    });
});
    

//saves the data of the user
app.post('/:id/enterdetails' , (req,res) => {
 
    Company.findByIdAndUpdate({_id : req.params.id} , {$set : {
        companyname : req.body.companyname , 
        website : req.requirebody.website
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