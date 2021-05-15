const bodyparser = require('body-parser');
const Company = require('../../../model/Company');
const Student = require('../../../model/Student');
const cookieParser = require('cookie-parser');
const generateToken = require('./generateToken');
const notification = require('../../../model/notifications');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var session = require('cookie-session');
var flash = require('connect-flash');

const express = require('express');
const app = express();
app.set('view engine', 'ejs');

app.use(
  bodyparser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(express.static('public'));

app.use(
  session({
    secret: 'secret',
    cookie: { maxAge: 6000 },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

/*page rendered for login */
app.get('/', (req, res) => {
  var k = req.flash('message');
  res.render('loginCompany', { message: k });
});

/*Login of a company */
app.post('/', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  Company.findOne({ email: email }, (err, foundcompany) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      if (foundcompany) {
        bcrypt.compare(password, foundcompany.password, (err, result) => {
          if (result) {
            try {
              generateToken(res, foundcompany._id);
              res.redirect(
                '/company/login/' + foundcompany._id + '/companyprofile'
              );
            } catch (error) {
              console.log(error);
              return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
            }
            //Redirecting to the company profile
          } else if (err) {
            console.log(err);
            return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
          }
        });
      } else {
        req.flash('message', 'First Register yourself');
        res.redirect('/company/login');
      }
    }
  });
});

/*Verify that the company has confirmed his email */
const verifyMail = async (req, res, next) => {
  const id = req.params.id || '';
  if (!id) {
    req.flash('message', 'First Register yourself');
    res.redirect('/company/login');
  } else {
    Company.findById({ _id: id }, (err, company) => {
      if (err) {
        console.log(err);
        return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
      } else {
        if (company) {
          if (company.confirmed && company.confirmedbyAdmin) {
            next();
          } else if (company.confirmed) {
            req.flash('message', 'Plz wait for admin to confirm');
            return res.redirect('/company/login');
          } else {
            req.flash('message', 'First Confirm Your Mail');
            return res.redirect('/company/login');
          }
        } else {
          req.flash('message', 'Not registered company');
          return res.redirect('/company/login');
        }
      }
    });
  }
};

/* Verify the token in the cookies */

const verifyToken = async (req, res, next) => {
  const token = req.cookies['CompanyLogin'] || '';
  try {
    if (!token) {
      res.clearCookie('CompanyLogin');
      req.flash('message', 'Wrong Link!! Login Again');
      return res.redirect('/company/login');
    }
    const decrypt = await jwt.verify(token, 'rohitMittalisthebest');
    if (decrypt.id === req.params.id) {
      next();
    } else {
      res.clearCookie('CompanyLogin');
      req.flash('message', 'Wrong Link!! Login Again');
      return res.redirect('/company/login');
    }
  } catch (err) {
    console.log(err);
    res.clearCookie('CompanyLogin');
    req.flash('message', 'Something Wrong Happended!! Login Again');
    return res.redirect('/company/login');
  }
};

app.use('/:id', verifyMail);
app.use('/:id', verifyToken);

/*Renders the company profile  */
app.get('/:id/companyprofile', (req, res) => {
  //profile read_experience write_experience edit_profile are the links given to the buttons on the company profile
  const profile = '/company/login/' + req.params.id + '/companyprofile';
  const edit_profile = '/company/login/' + req.params.id + '/editProfile';
  const applied_students =
    '/company/login/' + req.params.id + '/appliedStudents';
  const Addnotificationlink = '/company/login/' + req.params.id + '/Addnotice';
  const log_out = '/company/login/' + req.params.id + '/logOut';
  Company.findById({ _id: req.params.id }, (err, company) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      if (company) {
        res.render('companyprofile', {
          profile: profile,
          edit_profile: edit_profile,
          applied_students: applied_students,
          log_out: log_out,
          email: company.email,
          Addnotificationlink: Addnotificationlink,
          companyname: company.companyname,
          about_company: company.about_company,
          website_link: company.website,
          organization_type: company.org_type,
          industry_sector: company.industry_sector,
          about_company: company.about_company,
          job_profile: company.job_profile,
          duration: company.duration,
          pass_out_batch: company.batch,
          recruitment_type: company.recruitment,
          location: company.location,
          tentative_joining_date: company.date.toLocaleString('en-us', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          job_description: company.description,
          eligible_branch: company.eligible_branch,
          min_cgpa: company.min_cgpa,
          min_10_percent: company.min_10_percent,
          min_12_percent: company.min_12_percent,
          package: company.package,
          deadline_date: company.deadline_date.toLocaleString('en-us', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        });
      }
    }
  });
});

//Renderes the edit profile page with the last given data by the company
app.get('/:id/editProfile', (req, res) => {
  //profile read_experience write_experience edit_profile are the links given to the buttons on the company profile
  const profile = '/company/login/' + req.params.id + '/companyprofile';
  const edit_profile = '/company/login/' + req.params.id + '/editProfile';
  const applied_students =
    '/company/login/' + req.params.id + '/appliedStudents';
  const log_out = '/company/login/' + req.params.id + '/logOut';
  const link = '/company/login/' + req.params.id + '/editProfile';
  const Addnotificationlink = '/company/login/' + req.params.id + '/Addnotice';
  Company.findById({ _id: req.params.id }, (err, company) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      res.render('editCompanyProfile', {
        profile: profile,
        applied_students: applied_students,
        edit_profile: edit_profile,
        log_out: log_out,
        link: link,
        Addnotificationlink: Addnotificationlink,
        companyname: company.companyname,
        about_company: company.about_company,
        email: company.email,
        website_link: company.website,
        organization_type: company.org_type,
        industry_sector: company.industry_sector,
        about_company: company.about_company,
        job_profile: company.job_profile,
        duration: company.duration,
        pass_out_batch: company.batch,
        recruitment_type: company.recruitment,
        location: company.location,
        tentative_joining_date: company.date.toLocaleString('en-us', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        job_description: company.description,
      });
    }
  });
});

app.get('/:id/Addnotice/', (req, res) => {
  var msg = req.flash('message');
  const profile = '/company/login/' + req.params.id + '/companyprofile';
  const edit_profile = '/company/login/' + req.params.id + '/editProfile';
  const applied_students =
    '/company/login/' + req.params.id + '/appliedStudents';
  const log_out = '/company/login/' + req.params.id + '/logOut';
  const Addnotificationlink = '/company/login/' + req.params.id + '/Addnotice';
  Company.findById({ _id: req.params.id }, (err, ADMIN) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      notification.find({}, (err, notices) => {
        if (err) {
          console.log(err);
          return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
        } else {
          res.render('addNewNotice_company', {
            message: msg,
            profile: profile,
            applied_students: applied_students,
            edit_profile: edit_profile,
            log_out: log_out,
            Addnotificationlink: Addnotificationlink,
            notices: notices,
          });
        }
      });
    }
  });
});

app.post('/:id/Addnotice/', (req, res) => {
  const notice_body = req.body.notice;
  Company.findById({ _id: req.params.id }, (err, company) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      const created_by = company.companyname;
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
          req.flash('message', 'NOTICE ADDED');
          res.redirect('/company/login/' + req.params.id + '/Addnotice');
        }
      });
    }
  });
});

//Changes the data according to the gievn data and redirects the user to his profile
app.post('/:id/editProfile', (req, res) => {
  Company.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        companyname: req.body.companyname,
        about_company: req.body.about_company,
        duration: req.body.duration,
        website_link: req.body.website_link,
        organization_type: req.body.organization_type,
        industry_sector: req.body.industry_sector,
        about_company: req.body.about_company,
        job_profile: req.body.job_profile,
        pass_out_batch: req.body.pass_out_batch,
        recruitment_type: req.body.recruitment_type,
        location: req.body.location,
        tentative_joining_date: req.body.tentative_joining_date.toLocaleString(
          'en-us',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        ),
        description: req.body.description,
      },
    },
    { new: true },
    (err, company) => {
      if (err) {
        console.log(err);
        return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
      } else {
        res.redirect('/company/login/' + req.params.id + '/companyprofile');
      }
    }
  );
});

app.get('/:id/appliedStudents', (req, res) => {
  const profile = '/company/login/' + req.params.id + '/companyprofile';
  const edit_profile = '/company/login/' + req.params.id + '/editProfile';
  const applied_students =
    '/company/login/' + req.params.id + '/appliedStudents';
  const Addnotificationlink = '/company/login/' + req.params.id + '/Addnotice';
  const log_out = '/company/login/' + req.params.id + '/logOut';
  Company.findById({ _id: req.params.id }, (err, company) => {
    if (err) {
      console.log(err);
      return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
    } else {
      if (company) {
        let studentIds = company.students;
        let newStudentIds = studentIds.map((s) => s.trim());
        Student.find({ _id: { $in: newStudentIds } }, (error, students) => {
          if (error) {
            console.log(error);
            return res.json({ msg: 'Something went wrong! Plz Go back and Try Again' });
          } else {
            for (student in students) {
              if (student.resume) {
                console.log(student.resume);
              }
            }
            let newStudents = students.map((student) => {
              if (student.resume) {
                student.resumeURL =
                'https://careerservices.herokuapp.com/'+student.resume.id + '/file';
                  //'http://localhost:3000/' + student.resume.id + '/file'; 
              }
              return student;
            });

            res.render('applied_students', {
              profile: profile,
              applied_students: applied_students,
              edit_profile: edit_profile,
              Addnotificationlink: Addnotificationlink,
              log_out: log_out,
              students: newStudents,
            });
          }
        });
      }
    }
  });
});

app.get('/:id/logOut', (req, res) => {
  res.clearCookie('CompanyLogin');
  res.redirect('/company/login');
});

module.exports = app;
