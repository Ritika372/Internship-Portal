const bodyparser = require("body-parser");
const Company = require('../../../model/Company');
const cookieParser=require("cookie-parser");
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(express.static("public"));
/*page rendered for login */
app.get('/' , (req,res) => {
    res.render("loginCompany");
});

/*Login of a company */
app.post("/" , (req,res)=>{
   let email = req.body.email;
    let password = req.body.password;
    Company.findOne({email : email }, (err ,foundcompany) => {
        if(err){
            res.send("Something Wrong Happened");
            console.log(err);
        }
        else{
            if(foundcompany){
                bcrypt.compare(password, foundcompany.password , (err,result) => {
                    if(result){
                        try{
                            generateToken(res,foundcompany._id);
                            res.redirect('/company/login/'+foundcompany._id+'/companyprofile');
                        }
                        catch(error){
                              
                              res.send(error);
                        }
                        //Redirecting to the company profile
                    }
                    else if(err){
                        console.log(err);
                    }
                });
            }
            else{
                res.send("First Register yourself");
            }
        }
    });
});

/*Verify that the company has confirmed his email */
const verifyMail = async (req, res, next) => {
    const id=req.params.id||"";
    if(!id)
    {
       return res.send("First Register");
    }
    else{
        Company.findById({_id:id},(err,company)=>{
            if(err)
            {
                 console.log(err);
            }
            else{
                if(company){
                             if(company.confirmed)
                               {
                                    next();
                               }
                              else{
                                   return res.send("First COnfirm Your Mail");
                             }
                       }else{
                           return res.send("Not registered company");

            }}
        })
    
    }
    
  };

/*Verify that the company has been confirmed  by admin*/
const verifiedByadmin = async (req, res, next) => {
    const id=req.params.id||"";
    if(!id)
    {
       return res.send("First Register");
    }
    else{
        Company.findById({_id:id},(err,company)=>{
            if(err)
            {
                 console.log(err);
            }
            else{
                if(company){
                             if(company.confirmedbyAdmin)
                               {
                                    next();
                               }
                              else{
                                   return res.send("Plz wait for admin to confirm");
                             }
                       }else{
                           return res.send("Not registered company");

            }}
        })
    
    }
    
  };



/* Verify the token in the cookies */

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

app.use("/:id",verifyMail);
app.use("/:id",verifiedByadmin);
app.use("/:id",verifyToken);



/*Renders the company profile  */
app.get('/:id/companyprofile' , (req,res) => {
//profile read_experience write_experience edit_profile are the links given to the buttons on the company profile
    const profile = '/company/login/'+req.params.id+'/companyprofile';
    const edit_profile= '/company/login/'+req.params.id+'/editProfile';
    const log_out='/company/login/'+req.params.id+'/logOut';
    Company.findById({_id: req.params.id} , (err,company) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            if(company){
            res.render("companyprofile" , {
                profile:profile,
                edit_profile:edit_profile,
                log_out:log_out,
                email:company.email,
                companyname: company.companyname , 
                about_company :company.about_company , 
                website_link : company.website, 
                organization_type : company.org_type, 
                industry_sector: company.industry_sector,
                about_company : company.about_company,
                job_profile: company.job_profile,
                duration:company.duration,
                pass_out_batch : company.batch,
                recruitment_type: company.recruitment,
                location : company.location,
                tentative_joining_date: company.date,
                job_description: company.description
              });
        }
    }});
});


//Renderes the edit profile page with the last given data by the company
app.get('/:id/editProfile' , (req,res) => {
      //profile read_experience write_experience edit_profile are the links given to the buttons on the company profile
      const profile = '/company/login/'+req.params.id+'/companyprofile';
      const edit_profile= '/company/login/'+req.params.id+'/editProfile';
      const log_out='/company/login/'+req.params.id+'/logOut';
    //it is for the post button so that app.post works
    const link = '/company/login/'+req.params.id+'/editProfile';
    Company.findById({_id: req.params.id} , (err,company) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.render("editCompanyProfile" , {
                profile:profile,
                edit_profile:edit_profile,
                log_out:log_out,
                link:link,
                companyname: company.companyname , 
                about_company :company.about_company , 
                email: company.email, 
                website_link : company.website, 
                organization_type : company.org_type, 
                industry_sector: company.industry_sector,
                about_company : company.about_company,
                job_profile: company.job_profile,
                duration:company.duration,
                pass_out_batch : company.batch,
                recruitment_type: company.recruitment,
                location : company.location,
                tentative_joining_date: company.date,
                job_description: company.description
              });
        }
    });

});

//Changes the data according to the gievn data and redirects the user to his profile
app.post('/:id/editProfile' , (req,res) => {


    Company.findByIdAndUpdate({_id : req.params.id} , {$set : {
        companyname: req.body.companyname , 
        about_company :req.body.about_company , 
        duration:req.body.duration,
        website_link : req.body.website_link, 
        organization_type : req.body.organization_type, 
        industry_sector: req.body.industry_sector,
        about_company :req.body.about_company,
        job_profile: req.body.job_profile,
        pass_out_batch : req.body.pass_out_batch,
        recruitment_type: req.body.recruitment_type,
        location : req.body.location,
        tentative_joining_date: req.body.tentative_joining_date,
        description: req.body.description
    }}  ,{new: true} ,(err,company) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.redirect('/company/login/'+req.params.id+'/companyprofile');
        }
    });
});


app.get("/:id/logOut",(req,res)=>{
    res.clearCookie('CompanyLogin');
   res.redirect('/company/login');
});


module.exports = app;