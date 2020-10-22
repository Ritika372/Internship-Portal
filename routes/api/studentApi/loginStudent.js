const bodyparser = require("body-parser");
const Student = require('../../../model/Student');
const cookieParser=require("cookie-parser");
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
const InterviewExp = require('../../../model/Interview');
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
    res.render("loginStudent");
});

/*Login of a student */
app.post("/" , (req,res)=>{
   let rollno = req.body.rollno;
    let password = req.body.password;
    Student.findOne({rollno : rollno }, (err ,foundStudent) => {
        if(err){
            res.send("Something Wrong Happened");
            console.log(err);
        }
        else{
            if(foundStudent){
                bcrypt.compare(password, foundStudent.password , (err,result) => {
                    if(result){
                        try{
                            generateToken(res,foundStudent._id,foundStudent.rollno);
                            res.redirect('/student/login/'+foundStudent._id+'/studentprofile');
                        }
                        catch(error){
                              
                              res.send(error);
                        }
                        //Redirecting to the student profile

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

/*Verify that the student has confirmed his email */
const verifyMail = async (req, res, next) => {
    const id=req.params.id||"";
    if(!id)
    {
       return res.send("First Register");
    }
    else{
        Student.findById({_id:id},(err,student)=>{
            if(student.confirmed)
            {
             next();
            }
            else{
                return res.send("First COnfirm Your Mail");
            }
        })
    
    }
    
  };

app.use("/:id",verifyMail);


/* Verify the token in the cookies */

const verifyToken = async (req, res, next) => {
    const token = req.cookies['studentLogin']|| '';
    try {
      if (!token) {
        return res.redirect('/student/login');
      }
      const decrypt = await jwt.verify(token,  "rohitMittalisthebest");
      if(decrypt.id === req.params.id)
      {
          next();
      }
      else
      {
          console.log("in else");
        return res.redirect('/student/login');  
      }
    } catch (err) {
        console.log(err);
        return res.redirect('/student/login');
    }
  };


app.use("/:id",verifyToken);



/*Renders the student profile  */
app.get('/:id/studentprofile' , (req,res) => {
//profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
    const profile = '/student/login/'+req.params.id+'/studentprofile';
    const read_experience = '/student/login/'+req.params.id+'/experiences';
    const write_experience = '/student/login/'+req.params.id+'/submitexperience';
    const edit_profile= '/student/login/'+req.params.id+'/editProfile';
    const log_out='/student/login/'+req.params.id+'/logOut';
    Student.findById({_id: req.params.id} , (err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            if(student){
            res.render("studentprofile" , {
                profile:profile,
                read_experience:read_experience,
                write_experience:write_experience,
                edit_profile:edit_profile,
                log_out:log_out,
                firstname : student.firstname , 
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
    }});
});


//It renderes the experience which are confirmed by the admin
app.get('/:id/experiences' , (req,res) => {
    InterviewExp.find({confirmed: true} , (err,experience) => {
    //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
           const profile = '/student/login/'+req.params.id+'/studentprofile';
            const read_experience = '/student/login/'+req.params.id+'/experiences';
            const write_experience = '/student/login/'+req.params.id+'/submitexperience';
            const edit_profile= '/student/login/'+req.params.id+'/editProfile';
            const log_out='/student/login/'+req.params.id+'/logOut';
        if(err){
            console.log(err);

        }
        else{
            res.render("Experiences" , {
                profile:profile,
                read_experience:read_experience,
                write_experience:write_experience,
                edit_profile:edit_profile,
                log_out:log_out,
                experience: experience});
        }
    });
});


//renders the submitting a new experience page
app.get('/:id/submitexperience' , (req,res) => {
     //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
    const profile = '/student/login/'+req.params.id+'/studentprofile';
    const read_experience = '/student/login/'+req.params.id+'/experiences';
    const write_experience = '/student/login/'+req.params.id+'/submitexperience';
    const edit_profile= '/student/login/'+req.params.id+'/editProfile';
    const log_out='/student/login/'+req.params.id+'/logOut';
    res.render("submitExp",{
        profile:profile,
        read_experience:read_experience,
        write_experience:write_experience,
        edit_profile:edit_profile,
        log_out:log_out
    });
});

//adds the new experience but is not confirmed
app.post('/:id/submitexperience', (req,res) => {
 
    let company = req.body.companyname;
    let branch = req.body.branch;
    let exp = req.body.experience;
    let choice = req.body.choice;
    let rollno="";
    Student.findById({_id: req.params.id} , (err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            if(student)
           {rollno=student.rollno;
            const Experience = new InterviewExp({
                company: company,
                branch: branch,
                exp :exp,
                choice: choice,
                rollno:rollno
            });
            Experience.save((err) => {
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect('/student/login/'+req.params.id+'/studentprofile');
                    console.log("Experience submitted");
                   // res.send("Experience submitted successfully!. Please wait for the admin to confirm.")
                }
            });
          }
          else{
              res.send("Something wrong happened");
          }

        }});
    
});

//Renderes the edit profile page with the last given data by the student
app.get('/:id/editProfile' , (req,res) => {
      //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile

    const profile = '/student/login/'+req.params.id+'/studentprofile';
    const read_experience = '/student/login/'+req.params.id+'/experiences';
    const write_experience = '/student/login/'+req.params.id+'/submitexperience';
    const edit_profile= '/student/login/'+req.params.id+'/editProfile';
    const log_out='/student/login/'+req.params.id+'/logOut';
    //it is for the post button so that app.post works
    const link = '/student/login/'+req.params.id+'/editProfile';
    Student.findById({_id: req.params.id} , (err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.render("editProfile" , {
                profile:profile,
                read_experience:read_experience,
                write_experience:write_experience,
                edit_profile:edit_profile,
                log_out:log_out,
                link:link,
                firstname : student.firstname , 
                lastname :student.lastname , 
                branch: student.branch, 
                degree : student.degree, 
                college_id:student.rollno,
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

//Changes the data according to the gievn data and redirects the user to his profile
app.post('/:id/editProfile' , (req,res) => {

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
            res.redirect('/student/login/'+req.params.id+'/studentprofile');
        }
    });
});


app.get("/:id/logOut",(req,res)=>{
    res.clearCookie('studentLogin');
   res.redirect('/student/login');
});


module.exports = app;