const express = require("express");
const bodyparser = require("body-parser");
const InterviewExp = require('../../../model/Interview');
const admin = require('../../../model/admin');
const app = express();
const Student= require('../../../model/Student');
const Company = require('../../../model/Company');
const notification = require('../../../model/notifications');
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

const cookieParser = require("cookie-parser");
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
app.use(cookieParser());


app.use(express.static("public"));
const bcrypt = require("bcrypt");
const saltRounds = 10;
var session=require("express-session")
var flash=require("connect-flash");
const { has } = require("config");


app.use(session({
    secret:'secret',
    cookie:{maxAge:6000},
    resave:false,
    saveUninitialized:false
}));

app.use(flash());

const verifyToken = async (req, res, next) => {
    const token = req.cookies['adminLogin'] || '';
    try {
        if (!token) {
            return res.redirect('/admin/login');
        }
        const decrypt = await jwt.verify(token, "rohitMittalisthebest");
        console.log(decrypt.id)
        console.log(req.params.id);
        if (decrypt.id === req.params.id) {
            next();
        }
        else {
            return res.redirect('/admin/login');
        }
    } catch (err) {
        console.log(err);
        return res.redirect('/admin/login');
    }
  // next();
};

app.get('/' , (req,res) => {
    res.render('loginAdmin');
});

app.post("/", (req, res) => {
    let email = req.body.emailAdmin;
    let password = req.body.passAdmin;
    console.log(email);

    admin.findOne({ email: email }, (err, foundAdmin) => {
        console.log("here")
        if (err) {
            res.send("Something Wrong Happened");
            console.log(err);
        }
        else {
            console.log("hhe");
            if (foundAdmin) {
                bcrypt.compare(password, foundAdmin.password, (err, result) => {
                    if (result) {
                        try {
                            generateToken(res, foundAdmin._id, foundAdmin.email);
                            res.redirect('/admin/login/' + foundAdmin._id + '/home');
                        }
                        catch (error) {

                            res.send(error);
                        }
                    }
                    else if (err) {
                        console.log(err);
                    }
                });
            }
            else {
               // req.flash("message","NOT ADMIN");
                res.redirect("/admin/login")
            }
        }
    });

});

app.use("/:id", verifyToken);

app.get('/:id/home/',(req,res)=>{
    const home = '/admin/login/' + req.params.id + '/home';
    const experiencelink = '/admin/login/' + req.params.id + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.id + '/conf_company';
    const studentslink = '/admin/login/' + req.params.id + '/Students';
    const companieslink = '/admin/login/' + req.params.id + '/Companies';
    const settings='/admin/login/' + req.params.id + '/settings';
    const notificationlink='/admin/login/' + req.params.id + '/notifications';
    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
                res.render('adminHome',{home:home,
                    experiencelink:experiencelink,
                    confirm_companieslink:confirm_companieslink,
                    studentslink:studentslink,
                    companieslink:companieslink,
                    main:ADMIN.main_admin,
                    settings:settings,
                    notificationlink:notificationlink,
                    name:ADMIN.name});
        }
    });

});

app.get('/:id/Students/' , (req,res)=> {
    const home = '/admin/login/' + req.params.id + '/home';
    const experiencelink = '/admin/login/' + req.params.id + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.id + '/conf_company';
    const studentslink = '/admin/login/' + req.params.id + '/Students';
    const companieslink = '/admin/login/' + req.params.id + '/Companies';
    const settings='/admin/login/' + req.params.id + '/settings';
    const notificationlink='/admin/login/' + req.params.id + '/notifications';
    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
    Student.find({},(error,students)=>
               {
                if(error){
                    console.log(error);
                    return res.json({msg: "Something went wrong!"});
                }
                else{
                    res.render("adminStudents" , {
                        home:home,
        experiencelink:experiencelink,
        confirm_companieslink:confirm_companieslink,
        studentslink:studentslink,
        companieslink:companieslink,
        settings:settings,
        main:ADMIN.main_admin,
        notificationlink:notificationlink,
                        students:students
                      });
                }
               })
           }}
)});

app.get('/:id/Companies/' , (req,res)=> {
    const home = '/admin/login/' + req.params.id + '/home';
    const experiencelink = '/admin/login/' + req.params.id + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.id + '/conf_company';
    const studentslink = '/admin/login/' + req.params.id + '/Students';
    const companieslink = '/admin/login/' + req.params.id + '/Companies';
    const settings='/admin/login/' + req.params.id + '/settings';
    const notificationlink='/admin/login/' + req.params.id + '/notifications';
    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
    Company.find({},(error,companies)=>
               {
                if(error){
                    console.log(error);
                    return res.json({msg: "Something went wrong!"});
                }
                else{
                    res.render("adminAllCompanies" , {
                        home:home,
        experiencelink:experiencelink,
        confirm_companieslink:confirm_companieslink,
        studentslink:studentslink,
        settings:settings,
        main:ADMIN.main_admin,
        companieslink:companieslink,
        notificationlink:notificationlink,
                        companies:companies
                      });
                }
               })
           }}
)});


app.get('/:adminid/experiences' , (req,res) => {
    const home = '/admin/login/' + req.params.adminid + '/home';
    const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.adminid + '/conf_company';
    const studentslink = '/admin/login/' + req.params.adminid + '/Students';
    const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
    const confirmexp='/admin/login/' + req.params.adminid + '/confirmexp';
    const deleteexp=  '/admin/login/' + req.params.adminid +'/deleteexp';
    const settings='/admin/login/' + req.params.adminid + '/settings';
    const notificationlink='/admin/login/' + req.params.adminid + '/notifications';
    admin.findById({_id : req.params.adminid} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{

    InterviewExp.find({confirmed: false} , (err,experience) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("exp_admin" , {
                home:home,
                experiencelink:experiencelink,
                confirm_companieslink:confirm_companieslink,
                studentslink:studentslink,
                companieslink:companieslink,
                confirmexp:confirmexp,
                deleteexp:deleteexp,
                settings:settings,
                main:ADMIN.main_admin,
                notificationlink:notificationlink,
                experience: experience});
        }
    })
}
})
});
app.post('/:adminid/confirmexp', (req,res) => {
    const home = '/admin/login/' + req.params.adminid + '/home';
    const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.adminid + '/conf_company';
    const studentslink = '/admin/login/' + req.params.adminid + '/Students';
    const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
    const confirmexp='/admin/login/' + req.params.adminid + '/confirmexp';
    const deleteexp=  '/admin/login/' + req.params.adminid +'/deleteexp';
    const settings='/admin/login/' + req.params.adminid + '/settings';
    const notificationlink='/admin/login/' + req.params.adminid + '/notifications';
    admin.findById({_id : req.params.adminid} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
  
   InterviewExp.findByIdAndUpdate({_id : req.body.id}, {confirmed: true} , (err) => {
       if(err){
           console.log(err);
       }
       else{
           console.log("updated successfully");
           InterviewExp.find({confirmed: false} , (err,experience) => {
            if(err){
                console.log(err);
            }
            else{
                res.render("exp_admin" , {home:home,
                    experiencelink:experiencelink,
                    confirm_companieslink:confirm_companieslink,
                    studentslink:studentslink,
                    companieslink:companieslink,
                    confirmexp:confirmexp,
                    deleteexp:deleteexp,
                    settings:settings,
                    main:ADMIN.main_admin,
                    notificationlink:notificationlink,
                    experience: experience});
        }
    })
}
})
}});
});
app.post('/:adminid/deleteexp', (req,res) => {
    const home = '/admin/login/' + req.params.adminid + '/home';
    const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.adminid + '/conf_company';
    const studentslink = '/admin/login/' + req.params.adminid + '/Students';
    const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
    const confirmexp='/admin/login/' + req.params.adminid + '/confirmexp';
    const deleteexp=  '/admin/login/' + req.params.adminid +'/deleteexp';
    const settings='/admin/login/' + req.params.adminid + '/settings';
    const notificationlink='/admin/login/' + req.params.adminid + '/notifications';
    admin.findById({_id : req.params.adminid} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
  
   InterviewExp.deleteOne({_id : req.body.id}, (err) => {
       if(err){
           console.log(err);
       }
       else{
           console.log("deleted successfully");
           InterviewExp.find({confirmed: false} , (err,experience) => {
            if(err){
                console.log(err);
            }
            else{
                res.render("exp_admin" , {
                    home:home,
                    experiencelink:experiencelink,
                    confirm_companieslink:confirm_companieslink,
                    studentslink:studentslink,
                    companieslink:companieslink,
                    confirmexp:confirmexp,
                deleteexp:deleteexp,
                settings:settings,
                main:ADMIN.main_admin,
                notificationlink:notificationlink,
                    experience: experience});
            }
           });
       }
   });
   

}})});



app.get('/:adminid/conf_company' , (req,res) => {
    const home = '/admin/login/' + req.params.adminid + '/home';
    const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.adminid + '/conf_company';
    const studentslink = '/admin/login/' + req.params.adminid + '/Students';
    const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
    const confirmcomp = '/admin/login/' + req.params.adminid + '/confirmcompany';
    const deletecomp = '/admin/login/' + req.params.adminid + '/deletecompany';
    const settings='/admin/login/' + req.params.adminid + '/settings';
    const notificationlink='/admin/login/' + req.params.adminid + '/notifications';
    admin.findById({_id : req.params.adminid} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
  
    Company.find({confirmed: true,confirmedbyAdmin: false} , (err,company) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("company_admin" , {home:home,
                experiencelink:experiencelink,
                confirm_companieslink:confirm_companieslink,
                studentslink:studentslink,
                companieslink:companieslink,
                confirmcomp:confirmcomp,
                settings:settings,
                main:ADMIN.main_admin,
                deletecomp:deletecomp,
                notificationlink:notificationlink,
                companies: company});
        }
    });
}}
);});
app.post('/:adminid/confirmcompany', (req,res) => {
    const home = '/admin/login/' + req.params.adminid + '/home';
    const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.adminid + '/conf_company';
    const studentslink = '/admin/login/' + req.params.adminid + '/Students';
    const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
    const confirmcomp = '/admin/login/' + req.params.adminid + '/confirmcompany';
    const deletecomp = '/admin/login/' + req.params.adminid + '/deletecompany';
     const settings='/admin/login/' + req.params.adminid + '/settings';
     const notificationlink='/admin/login/' + req.params.adminid + '/notifications';
    admin.findById({_id : req.params.adminid} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
   Company.findByIdAndUpdate({_id : req.body.id}, {confirmedbyAdmin: true} , (err) => {
       if(err){
           console.log(err);
       }
       else{
             Company.find({confirmed: true,confirmedbyAdmin: false} , (err,company) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("company_admin" , {
                home:home,
                experiencelink:experiencelink,
                confirm_companieslink:confirm_companieslink,
                studentslink:studentslink,
                companieslink:companieslink,
                confirmcomp:confirmcomp,
                settings:settings,
                main:ADMIN.main_admin,
                deletecomp:deletecomp,                        
                notificationlink:notificationlink,
                companies: company});
        }
    });
       }
   });}
   

});});

app.post('/:adminid/deletecompany', (req,res) => {
    const home = '/admin/login/' + req.params.adminid + '/home';
    const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.adminid + '/conf_company';
    const studentslink = '/admin/login/' + req.params.adminid + '/Students';
    const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
    const confirmcomp = '/admin/login/' + req.params.adminid + '/confirmcompany';
    const deletecomp = '/admin/login/' + req.params.adminid + '/deletecompany';
    const settings='/admin/login/' + req.params.adminid + '/settings';
    const notificationlink='/admin/login/' + req.params.adminid + '/notifications';
    admin.findById({_id : req.params.adminid} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
   Company.deleteOne({_id : req.body.id}, (err) => {
       if(err){
           console.log(err);
       }
       else{
        Company.find({confirmed: true,confirmedbyAdmin: false} , (err,company) => {
        if(err){
              console.log(err);
              }
       else{
          res.render("company_admin" , {
            home:home,
        experiencelink:experiencelink,
        confirm_companieslink:confirm_companieslink,
        studentslink:studentslink,
        companieslink:companieslink,
        confirmcomp:confirmcomp,
        settings:settings,
        main:ADMIN.main_admin,
        deletecomp:deletecomp,
        notificationlink:notificationlink,
        companies: company});
          }
          });
       }})}
   });
   
});




const verifyMainAdmin = async (req, res, next) => {
    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
            if(ADMIN.main_admin&&ADMIN.main_admin)
            {
                next();
            }
            else{
                res.redirect('/admin/login/' + req.params.id + '/home');
            }
        }})
};

app.use("/:id/settings/",verifyMainAdmin);
app.use("/:id/removeAdmin/",verifyMainAdmin);
app.use("/:id/addAdmin/",verifyMainAdmin);
app.get('/:id/settings/' , (req,res)=> {
    const home = '/admin/login/' + req.params.id + '/home';
    const experiencelink = '/admin/login/' + req.params.id + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.id + '/conf_company';
    const studentslink = '/admin/login/' + req.params.id + '/Students';
    const companieslink = '/admin/login/' + req.params.id + '/Companies';
    const settings='/admin/login/' + req.params.id + '/settings';
    const adminlink='/admin/login/'+req.params.id+'/removeAdmin';
    const addAdminlink='/admin/login/'+req.params.id+'/addAdmin';
    const notificationlink='/admin/login/' + req.params.id + '/notifications';
    admin.find({main_admin: false},(error,admins)=>
               {
                if(error){
                    console.log(error);
                    return res.json({msg: "Something went wrong!"});
                }
                else{
                   console.log(admins);
                    res.render("admin_settings" , {
                       home:home,
                       experiencelink:experiencelink,
                       confirm_companieslink:confirm_companieslink,
                       studentslink:studentslink,
                       companieslink:companieslink,
                       settings:settings,
                       remove:adminlink,
                       admins:admins,
                       notificationlink:notificationlink,
                       addAdmin:addAdminlink
                      });
                }
               })
           }
);

app.post('/:adminid/removeAdmin', (req,res) => {
   admin.deleteOne({_id : req.body.id}, (err) => {
       if(err){
           console.log(err);
       }
       else{
        admin.find({} , (err,company) => {
        if(err){
              console.log(err);
              }
       else{
        admin.find({main_admin: false},(error,admins)=>
        {
         if(error){
             console.log(error);
             return res.json({msg: "Something went wrong!"});
         }
         else{
            console.log(admins);
            res.redirect('/admin/login/' + req.params.adminid + '/settings');
         }
        })
          }
          });
       }
   });

});


app.post('/:id/addAdmin/', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    bcrypt.hash(password, saltRounds, (err, hash) => {
        const newAdmin = new admin({
            name: name,
            email: email,
            password: hash,
            main_admin:false,
        });
        newAdmin.save((err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('/admin/login/' + req.params.id + '/settings');
            }
        });
    });
});



app.get("/:id/notifications/",(req,res)=>{
    const home = '/admin/login/' + req.params.id + '/home';
    const experiencelink = '/admin/login/' + req.params.id + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.id + '/conf_company';
    const studentslink = '/admin/login/' + req.params.id + '/Students';
    const companieslink = '/admin/login/' + req.params.id + '/Companies';
    const settings='/admin/login/' + req.params.id + '/settings';
    const notificationlink='/admin/login/' + req.params.id + '/notifications';
    const Addnotificationlink='/admin/login/' + req.params.id + '/Addnotice';
    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
            notification.find({} , (err,notices) => {
                if(err){
                    console.log(err);
                }
                else{
                    notices.sort(function(a,b){
                        return new Date(b.date) - new Date(a.date);
                      });
                    res.render("notification_admin" , {
                        home:home,
                        experiencelink:experiencelink,
                        confirm_companieslink:confirm_companieslink,
                        studentslink:studentslink,
                        companieslink:companieslink,
                        settings:settings,
                        main:ADMIN.main_admin,
                        notificationlink:notificationlink,
                        Addnotificationlink:Addnotificationlink,
                        notices: notices});
                }
            })}
   });

})




app.get("/:id/Addnotice/",(req,res)=>{
    const home = '/admin/login/' + req.params.id + '/home';
    const experiencelink = '/admin/login/' + req.params.id + '/experiences';
    const confirm_companieslink = '/admin/login/' + req.params.id + '/conf_company';
    const studentslink = '/admin/login/' + req.params.id + '/Students';
    const companieslink = '/admin/login/' + req.params.id + '/Companies';
    const settings='/admin/login/' + req.params.id + '/settings';
    const notificationlink='/admin/login/' + req.params.id + '/notifications';
    const Addnotificationlink='/admin/login/' + req.params.id + '/Addnotice';
    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
            
                    res.render("addNewNotice_admin" , {
                        home:home,
                        experiencelink:experiencelink,
                        confirm_companieslink:confirm_companieslink,
                        studentslink:studentslink,
                        companieslink:companieslink,
                        settings:settings,
                        main:ADMIN.main_admin,
                        notificationlink:notificationlink,
                        Addnotificationlink:Addnotificationlink});
                
            }
   });

})



app.post("/:id/Addnotice/",(req,res)=>{
    const notice_body=req.body.notice;
 

    admin.findById({_id : req.params.id} , (err,ADMIN) => {
        if(err){
            console.log(err);
        }
        else{
            const created_by =ADMIN.name;
            const date=new Date().getTime();
            const notice = new notification({
                created_by:created_by,
                notice:notice_body,
                date:date
            });
            notice.save((err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.redirect('/admin/login/' + req.params.id + '/notifications');
                    // res.send("Experience submitted successfully!. Please wait for the admin to confirm.")
                }
            });
          }
   });

})


module.exports = app;