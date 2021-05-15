const express = require('express');
const bodyparser = require('body-parser');
const InterviewExp = require('../../../model/Interview');
const admin = require('../../../model/admin');
const app = express();
const Student = require('../../../model/Student');
const Company = require('../../../model/Company');
const notification = require('../../../model/notifications');
app.set('view engine', 'ejs');
app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);

const cookieParser = require('cookie-parser');
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
app.use(cookieParser());

app.use(express.static('public'));
const bcrypt = require('bcrypt');
const saltRounds = 10;
var session = require('cookie-session');
var flash = require('connect-flash');
const { has } = require('config');

app.use(
  session({
    secret: 'secret',
    cookie: { maxAge: 6000 },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

const verifyToken = async (req, res, next) => {
  const token = req.cookies['adminLogin'] || '';
  try {
    if (!token) {
      res.clearCookie('adminLogin');
      return res.redirect('/admin/login');
    }
    const decrypt = await jwt.verify(token, 'rohitMittalisthebest');
    if (decrypt.id === req.params.id) {
      next();
    } else {
      req.flash('message', 'Wrong Link Plz Login Again');
      return res.redirect('/admin/login');
    }
  } catch (err) {
    console.log(err);
    req.flash('message', 'Error Occured Plz login Again');
    return res.redirect('/admin/login');
  }
};

app.get('/', (req, res) => {
  var k = req.flash('message');
  res.render('loginAdmin', { message: k });
});

app.post('/', (req, res) => {
  let email = req.body.emailAdmin;
  let password = req.body.passAdmin;
  console.log(email);
  admin.findOne({ email: email }, (err, foundAdmin) => {
    if (err) {
      console.log(err);
      res.send('Something Wrong Happened!! Plz Try Again');
    } else {
      if (foundAdmin) {
        bcrypt.compare(password, foundAdmin.password, (err, result) => {
          if (err) {
            console.log(err);
            res.send("Something Wrong Happened!! Plz Try Again");
          }
          if (result) {
            try {
              generateToken(res, foundAdmin._id, foundAdmin.email);
              res.redirect('/admin/login/' + foundAdmin._id + '/home');
            } catch (error) {
              console.log(error);
              res.send("Try Again Plz");
            }
          }
          else{
            req.flash('message', 'Password And Login Id Does not Match!! Try Again');
            res.redirect('/admin/login');
          }
        }
        );
      } else {
          req.flash('message', 'Not A Registered Admin');
          res.redirect('/admin/login');
      }
    }
  });
});


app.use('/:id', verifyToken);

app.get('/:id/home/', (req, res) => {
  const home = '/admin/login/' + req.params.id + '/home';
  const experiencelink = '/admin/login/' + req.params.id + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.id + '/conf_company';
  const studentslink = '/admin/login/' + req.params.id + '/Students';
  const companieslink = '/admin/login/' + req.params.id + '/Companies';
  const settings = '/admin/login/' + req.params.id + '/settings';
  const notificationlink = '/admin/login/' + req.params.id + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      res.send("Something Wrong Happened!! Plz Go back and Try Again");
    } else  {
      res.render('adminHome', {
        home: home,
        experiencelink: experiencelink,
        confirm_companieslink: confirm_companieslink,
        studentslink: studentslink,
        companieslink: companieslink,
        main: ADMIN.main_admin,
        settings: settings,
        logOut:logOut,
        notificationlink: notificationlink,
        name: ADMIN.name,
      });
    }
  });
});


app.get('/:id/Students/', (req, res) => {
  const home = '/admin/login/' + req.params.id + '/home';
  const experiencelink = '/admin/login/' + req.params.id + '/experiences';
  const confirm_companieslink =
    '/admin/login/' + req.params.id + '/conf_company';
  const studentslink = '/admin/login/' + req.params.id + '/Students';
  const companieslink = '/admin/login/' + req.params.id + '/Companies';
  const settings = '/admin/login/' + req.params.id + '/settings';
  const notificationlink = '/admin/login/' + req.params.id + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
    } else {
      Student.find({}, (error, students) => {
        if (error) {
          console.log(error);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          res.render('adminStudents', {
            home: home,
            experiencelink: experiencelink,
            confirm_companieslink: confirm_companieslink,
            studentslink: studentslink,
            companieslink: companieslink,
            settings: settings,
            main: ADMIN.main_admin,
            logOut:logOut,
            notificationlink: notificationlink,
            students: students,
          });
        }
      });
    }
  });
});

app.get('/:id/Companies/', (req, res) => {
  const home = '/admin/login/' + req.params.id + '/home';
  const experiencelink = '/admin/login/' + req.params.id + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.id + '/conf_company';
  const studentslink = '/admin/login/' + req.params.id + '/Students';
  const companieslink = '/admin/login/' + req.params.id + '/Companies';
  const settings = '/admin/login/' + req.params.id + '/settings';
  const notificationlink = '/admin/login/' + req.params.id + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
    } else {
      Company.find({}, (error, companies) => {
        if (error) {
          console.log(error);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          res.render('adminAllCompanies', {
            home: home,
            experiencelink: experiencelink,
            confirm_companieslink: confirm_companieslink,
            studentslink: studentslink,
            settings: settings,
            main: ADMIN.main_admin,
            logOut:logOut,
            companieslink: companieslink,
            notificationlink: notificationlink,
            companies: companies,
          });
        }
      });
    }
  });
});

app.get('/:adminid/experiences', (req, res) => {
  const home = '/admin/login/' + req.params.adminid + '/home';
  const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.adminid + '/conf_company';
  const studentslink = '/admin/login/' + req.params.adminid + '/Students';
  const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
  const confirmexp = '/admin/login/' + req.params.adminid + '/confirmexp';
  const deleteexp = '/admin/login/' + req.params.adminid + '/deleteexp';
  const settings = '/admin/login/' + req.params.adminid + '/settings';
  const notificationlink ='/admin/login/' + req.params.adminid + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.adminid }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      InterviewExp.find({ confirmed: false }, (err, experience) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          res.render('exp_admin', {
            home: home,
            experiencelink: experiencelink,
            confirm_companieslink: confirm_companieslink,
            studentslink: studentslink,
            companieslink: companieslink,
            confirmexp: confirmexp,
            deleteexp: deleteexp,
            settings: settings,
            logOut:logOut,
            main: ADMIN.main_admin,
            notificationlink: notificationlink,
            experience: experience,
          });
        }
      });
    }
  });
});
app.post('/:adminid/confirmexp', (req, res) => {
  const home = '/admin/login/' + req.params.adminid + '/home';
  const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.adminid + '/conf_company';
  const studentslink = '/admin/login/' + req.params.adminid + '/Students';
  const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
  const confirmexp = '/admin/login/' + req.params.adminid + '/confirmexp';
  const deleteexp = '/admin/login/' + req.params.adminid + '/deleteexp';
  const settings = '/admin/login/' + req.params.adminid + '/settings';
  const notificationlink ='/admin/login/' + req.params.adminid + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.adminid }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      InterviewExp.findByIdAndUpdate( { _id: req.body.id },{ confirmed: true },
        (err) => {
          if (err) {
            console.log(err);
            return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
          } else {
            //console.log("updated successfully");
            InterviewExp.find({ confirmed: false }, (err, experience) => {
              if (err) {
                console.log(err);
              } else {
                res.render('exp_admin', {
                  home: home,
                  experiencelink: experiencelink,
                  confirm_companieslink: confirm_companieslink,
                  studentslink: studentslink,
                  companieslink: companieslink,
                  confirmexp: confirmexp,
                  deleteexp: deleteexp,
                  settings: settings,
                  logOut:logOut,
                  main: ADMIN.main_admin,
                  notificationlink: notificationlink,
                  experience: experience,
                });
              }
            });
          }
        }
      );
    }
  });
});
app.post('/:adminid/deleteexp', (req, res) => {
  const home = '/admin/login/' + req.params.adminid + '/home';
  const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.adminid + '/conf_company';
  const studentslink = '/admin/login/' + req.params.adminid + '/Students';
  const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
  const confirmexp = '/admin/login/' + req.params.adminid + '/confirmexp';
  const deleteexp = '/admin/login/' + req.params.adminid + '/deleteexp';
  const settings = '/admin/login/' + req.params.adminid + '/settings';
  const notificationlink ='/admin/login/' + req.params.adminid + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.adminid }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      InterviewExp.deleteOne({ _id: req.body.id }, (err) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          //console.log("deleted successfully");
          InterviewExp.find({ confirmed: false }, (err, experience) => {
            if (err) {
              console.log(err);
              return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
            } else {
              res.render('exp_admin', {
                home: home,
                experiencelink: experiencelink,
                confirm_companieslink: confirm_companieslink,
                studentslink: studentslink,
                companieslink: companieslink,
                confirmexp: confirmexp,
                deleteexp: deleteexp,
                settings: settings,
                logOut:logOut,
                main: ADMIN.main_admin,
                notificationlink: notificationlink,
                experience: experience,
              });
            }
          });
        }
      });
    }
  });
});

app.get('/:adminid/conf_company', (req, res) => {
  const home = '/admin/login/' + req.params.adminid + '/home';
  const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.adminid + '/conf_company';
  const studentslink = '/admin/login/' + req.params.adminid + '/Students';
  const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
  const confirmcomp = '/admin/login/' + req.params.adminid + '/confirmcompany';
  const deletecomp = '/admin/login/' + req.params.adminid + '/deletecompany';
  const settings = '/admin/login/' + req.params.adminid + '/settings';
  const notificationlink ='/admin/login/' + req.params.adminid + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.adminid }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      Company.find(
        { confirmed: true, confirmedbyAdmin: false },
        (err, company) => {
          if (err) {
            console.log(err);
            return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
          } else {
            res.render('company_admin', {
              home: home,
              experiencelink: experiencelink,
              confirm_companieslink: confirm_companieslink,
              studentslink: studentslink,
              companieslink: companieslink,
              confirmcomp: confirmcomp,
              settings: settings,
              main: ADMIN.main_admin,
              deletecomp: deletecomp,
              logOut:logOut,
              notificationlink: notificationlink,
              companies: company,
            });
          }
        }
      );
    }
  });
});
app.post('/:adminid/confirmcompany', (req, res) => {
  const home = '/admin/login/' + req.params.adminid + '/home';
  const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.adminid + '/conf_company';
  const studentslink = '/admin/login/' + req.params.adminid + '/Students';
  const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
  const confirmcomp = '/admin/login/' + req.params.adminid + '/confirmcompany';
  const deletecomp = '/admin/login/' + req.params.adminid + '/deletecompany';
  const settings = '/admin/login/' + req.params.adminid + '/settings';
  const notificationlink ='/admin/login/' + req.params.adminid + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.adminid }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      Company.findByIdAndUpdate(
        { _id: req.body.id },
        { confirmedbyAdmin: true },
        (err) => {
          if (err) {
            console.log(err);
            return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
          } else {
            Company.find(
              { confirmed: true, confirmedbyAdmin: false },
              (err, company) => {
                if (err) {
                  console.log(err);
                  return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
                } else {
                  res.render('company_admin', {
                    home: home,
                    experiencelink: experiencelink,
                    confirm_companieslink: confirm_companieslink,
                    studentslink: studentslink,
                    companieslink: companieslink,
                    confirmcomp: confirmcomp,
                    settings: settings,
                    main: ADMIN.main_admin,
                    deletecomp: deletecomp,
                    logOut:logOut,
                    notificationlink: notificationlink,
                    companies: company,
                  });
                }
              }
            );
          }
        }
      );
    }
  });
});

app.post('/:adminid/deletecompany', (req, res) => {
  const home = '/admin/login/' + req.params.adminid + '/home';
  const experiencelink = '/admin/login/' + req.params.adminid + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.adminid + '/conf_company';
  const studentslink = '/admin/login/' + req.params.adminid + '/Students';
  const companieslink = '/admin/login/' + req.params.adminid + '/Companies';
  const confirmcomp = '/admin/login/' + req.params.adminid + '/confirmcompany';
  const deletecomp = '/admin/login/' + req.params.adminid + '/deletecompany';
  const settings = '/admin/login/' + req.params.adminid + '/settings';
  const notificationlink ='/admin/login/' + req.params.adminid + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.adminid }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      Company.deleteOne({ _id: req.body.id }, (err) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          Company.find(
            { confirmed: true, confirmedbyAdmin: false },
            (err, company) => {
              if (err) {
                console.log(err);
                return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
              } else {
                res.render('company_admin', {
                  home: home,
                  experiencelink: experiencelink,
                  confirm_companieslink: confirm_companieslink,
                  studentslink: studentslink,
                  companieslink: companieslink,
                  confirmcomp: confirmcomp,
                  settings: settings,
                  main: ADMIN.main_admin,
                  logOut:logOut,
                  deletecomp: deletecomp,
                  notificationlink: notificationlink,
                  companies: company,
                });
              }
            }
          );
        }
      });
    }
  });
});

const verifyMainAdmin = async (req, res, next) => {
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      if (ADMIN.main_admin && ADMIN.main_admin) {
        next();
      } else {
        res.redirect('/admin/login/' + req.params.id + '/home');
      }
    }
  });
};

app.use('/:id/settings/', verifyMainAdmin);

app.use('/:id/removeAdmin/', verifyMainAdmin);

app.use('/:id/addAdmin/', verifyMainAdmin);

app.get('/:id/settings/', (req, res) => {
  const home = '/admin/login/' + req.params.id + '/home';
  const experiencelink = '/admin/login/' + req.params.id + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.id + '/conf_company';
  const studentslink = '/admin/login/' + req.params.id + '/Students';
  const companieslink = '/admin/login/' + req.params.id + '/Companies';
  const settings = '/admin/login/' + req.params.id + '/settings';
  const adminlink = '/admin/login/' + req.params.id + '/removeAdmin';
  const addAdminlink = '/admin/login/' + req.params.id + '/addAdmin';
  const notificationlink = '/admin/login/' + req.params.id + '/notifications';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.find({ main_admin: false }, (error, admins) => {
    if (error) {
      console.log(error);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      res.render('admin_settings', {
        home: home,
        experiencelink: experiencelink,
        confirm_companieslink: confirm_companieslink,
        studentslink: studentslink,
        companieslink: companieslink,
        settings: settings,
        remove: adminlink,
        admins: admins,
        logOut:logOut,
        notificationlink: notificationlink,
        addAdmin: addAdminlink,
      });
    }
  });
});

app.post('/:adminid/removeAdmin', (req, res) => {
  admin.deleteOne({ _id: req.body.id }, (err) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      admin.find({}, (err, company) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          admin.find({ main_admin: false }, (error, admins) => {
            if (error) {
              console.log(error);
              return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
            } else {
              res.redirect('/admin/login/' + req.params.adminid + '/settings');
            }
          });
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
      main_admin: false,
    });
    newAdmin.save((err, result) => {
      if (err) {
        console.log(err);
        return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
      } else {
        res.redirect('/admin/login/' + req.params.id + '/settings');
      }
    });
  });
});

app.get('/:id/notifications/', (req, res) => {
  const home = '/admin/login/' + req.params.id + '/home';
  const experiencelink = '/admin/login/' + req.params.id + '/experiences';
  const confirm_companieslink ='/admin/login/' + req.params.id + '/conf_company';
  const studentslink = '/admin/login/' + req.params.id + '/Students';
  const companieslink = '/admin/login/' + req.params.id + '/Companies';
  const settings = '/admin/login/' + req.params.id + '/settings';
  const notificationlink = '/admin/login/' + req.params.id + '/notifications';
  const Addnotificationlink = '/admin/login/' + req.params.id + '/Addnotice';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      notification.find({}, (err, notices) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          notices.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
          });
          res.render('notification_admin', {
            home: home,
            experiencelink: experiencelink,
            confirm_companieslink: confirm_companieslink,
            studentslink: studentslink,
            companieslink: companieslink,
            settings: settings,
            main: ADMIN.main_admin,
            logOut:logOut,
            notificationlink: notificationlink,
            Addnotificationlink: Addnotificationlink,
            notices: notices,
          });
        }
      });
    }
  });
});

app.get('/:id/Addnotice/', (req, res) => {
  const home = '/admin/login/' + req.params.id + '/home';
  const experiencelink = '/admin/login/' + req.params.id + '/experiences';
  const confirm_companieslink =
    '/admin/login/' + req.params.id + '/conf_company';
  const studentslink = '/admin/login/' + req.params.id + '/Students';
  const companieslink = '/admin/login/' + req.params.id + '/Companies';
  const settings = '/admin/login/' + req.params.id + '/settings';
  const notificationlink = '/admin/login/' + req.params.id + '/notifications';
  const Addnotificationlink = '/admin/login/' + req.params.id + '/Addnotice';
  const logOut = '/admin/login/' + req.params.id + '/logOut';
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      res.render('addNewNotice_admin', {
        home: home,
        experiencelink: experiencelink,
        confirm_companieslink: confirm_companieslink,
        studentslink: studentslink,
        companieslink: companieslink,
        settings: settings,
        main: ADMIN.main_admin,
        logOut:logOut,
        notificationlink: notificationlink,
        Addnotificationlink: Addnotificationlink,
      });
    }
  });
});

app.post('/:id/Addnotice/', (req, res) => {
  const notice_body = req.body.notice;
  admin.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      const created_by = ADMIN.name;
      const date = new Date().getTime();
      const notice = new notification({
        created_by: created_by,
        notice: notice_body,
        date: date,
      });
      notice.save((err) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          res.redirect('/admin/login/' + req.params.id + '/notifications');
        }
      });
    }
  });
});


app.get('/:id/logOut/', (req, res) => {
  res.clearCookie('adminLogin');
  res.redirect('/admin/login');
});
module.exports = app;
