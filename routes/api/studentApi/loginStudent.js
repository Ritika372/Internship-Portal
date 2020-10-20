const bodyparser = require("body-parser");
const Student = require('../../../model/Student');
const InterviewExp = require('../../../model/Interview');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

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
            console.log(err);
        }
        else{
            if(foundStudent){
                bcrypt.compare(password, foundStudent.password , (err,result) => {
                    if(result){
                        //Redirecting to the student profile
                        res.redirect('/student/login/'+foundStudent._id+'/studentprofile');
                    }
                    else if(err){
                        console.log(err);
                    }
                });
            }
        }
    });
});
app.get('/:id/studentprofile' , (req,res) => {
//profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
    const profile = '/student/login/'+req.params.id+'/studentprofile';
    const read_experience = '/student/login/'+req.params.id+'/experiences';
    const write_experience = '/student/login/'+req.params.id+'/submitexperience';
    const edit_profile= '/student/login/'+req.params.id+'/editProfile';

    Student.findById({_id: req.params.id} , (err,student) => {
        if(err){
            return res.json({msg: "Something went wrong!"});
        }
        else{
            res.render("studentprofile" , {
                profile:profile,
                read_experience:read_experience,
                write_experience:write_experience,
                edit_profile:edit_profile,
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
    });
});


//It renderes the experience which are confirmed by the admin
app.get('/:id/experiences' , (req,res) => {
    InterviewExp.find({confirmed: true} , (err,experience) => {
    //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
           const profile = '/student/login/'+req.params.id+'/studentprofile';
            const read_experience = '/student/login/'+req.params.id+'/experiences';
            const write_experience = '/student/login/'+req.params.id+'/submitexperience';
            const edit_profile= '/student/login/'+req.params.id+'/editProfile';
        if(err){
            console.log(err);

        }
        else{
            res.render("Experiences" , {
                profile:profile,
                read_experience:read_experience,
                write_experience:write_experience,
                edit_profile:edit_profile,
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
    res.render("submitExp",{
        profile:profile,
        read_experience:read_experience,
        write_experience:write_experience,
        edit_profile:edit_profile});
});

//adds the new experience but is not confirmed
app.post('/:id/submitexperience', (req,res) => {
 
    let company = req.body.companyname;
    let branch = req.body.branch;
    let exp = req.body.experience;
    let choice = req.body.choice;
    const Experience = new InterviewExp({
        company: company,
        branch: branch,
        exp :exp,
        choice: choice
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
});

//Renderes the edit profile page with the last given data by the student
app.get('/:id/editProfile' , (req,res) => {
      //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile

    const profile = '/student/login/'+req.params.id+'/studentprofile';
    const read_experience = '/student/login/'+req.params.id+'/experiences';
    const write_experience = '/student/login/'+req.params.id+'/submitexperience';
    const edit_profile= '/student/login/'+req.params.id+'/editProfile';
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




module.exports = app;