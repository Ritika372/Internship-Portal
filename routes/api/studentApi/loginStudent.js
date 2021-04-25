const bodyparser = require('body-parser');
const {
  createGridFSReadStream,
  getGridFSFiles,
} = require('../../../config/db');
const Student = require('../../../model/Student');
const Company = require('../../../model/Company');
const uploadFile = require('./upload');
const sendemails = require('./email');
const cookieParser = require('cookie-parser');
const generateToken = require('./generateToken');
const jwt = require('jsonwebtoken');
const InterviewExp = require('../../../model/Interview');
const notification = require('../../../model/notifications');
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
  res.render('loginStudent', { message: k });
});

app.get('/:id/file', async (req, res) => {
  try {
    const file = await getGridFSFiles(req.params.id);
    res.setHeader('content-type', file.contentType);
    const readStream = createGridFSReadStream(req.params.id);
    readStream.pipe(res);
  } catch (error) {
    console.log(error);
    res.status(404).send({ message: 'file not found' });
  }
});

/*Login of a student */
app.post('/', (req, res) => {
  let rollno = req.body.rollno;
  let password = req.body.password;
  Student.findOne({ rollno: rollno }, (err, foundStudent) => {
    if (err) {
      res.send('Something Wrong Happened');
      console.log(err);
    } else {
      if (foundStudent) {
        bcrypt.compare(password, foundStudent.password, (err, result) => {
          if (result) {
            try {
              generateToken(res, foundStudent._id, foundStudent.rollno);
              res.redirect(
                '/student/login/' + foundStudent._id + '/studentprofile'
              );
            } catch (error) {
              res.send(error);
            }
            //Redirecting to the student profile
          } else if (err) {
            console.log(err);
          }
        });
      } else {
        req.flash('message', 'First Register yourself');
        res.redirect('/student/login');
      }
    }
  });
});

/*Verify that the student has confirmed his email */
const verifyMail = async (req, res, next) => {
  const id = req.params.id || '';
  if (!id) {
    req.flash('message', 'First Register yourself');

    return res.redirect('/student/login');
  } else {
    Student.findById({ _id: id }, (err, student) => {
      if (err) {
        console.log(err);
      } else {
        if (student) {
          if (student.confirmed) {
            next();
          } else {
            req.flash('message', 'First Confirm Your Mail');
            return res.redirect('/student/login');
          }
        } else {
          req.flash('message', 'Not registered student');
          return res.redirect('/student/login');
        }
      }
    });
  }
};

app.use('/:id', verifyMail);

app.get('/:id/change_pswrd', (req, res) => {
  Student.findOne({ _id: req.params.id }, (err, foundStudent) => {
    if (err) {
      res.send('Something Wrong Happened');
      console.log(err);
    } else {
      if (foundStudent) {
        const expiration = 604800000;
        const id = foundStudent._id;
        const rollno = foundStudent.rollno;
        const token = jwt.sign({ id, rollno }, 'rohitMittalisthebest', {
          expiresIn: '7d',
        });
        const msg = 'Please Click on the given button to Change the password';
        //const link = 'http://localhost:3000/student/forgot_pass/check/' + token;
        const link = '/student/forgot_pass/check/' + token;
        sendemails(
          foundStudent.email,
          'Change Password',
          link,
          msg,
          'New Password'
        );
        req.flash('message', 'Check Your Emails');
        res.redirect('/student/login/' + req.params.id + '/editProfile');
      } else {
        res.send('First Register yourself');
      }
    }
  });
});

/* Verify the token in the cookies */

const verifyToken = async (req, res, next) => {
  const token = req.cookies['studentLogin'] || '';
  try {
    if (!token) {
      return res.redirect('/student/login');
    }
    const decrypt = await jwt.verify(token, 'rohitMittalisthebest');
    if (decrypt.id === req.params.id) {
      next();
    } else {
      return res.redirect('/student/login');
    }
  } catch (err) {
    console.log(err);
    return res.redirect('/student/login');
  }
};

app.use('/:id', verifyToken);

/*Renders the student profile  */
app.get('/:id/studentprofile', async (req, res) => {
  //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';

  Student.findById({ _id: req.params.id }, async (err, student) => {
    if (err) {
      return res.json({ msg: 'Something went wrong!' });
    } else {
      if (student) {
        let resumeUrl = null;
        if (student.resume) {
          resumeUrl = '/student/login/' + student.resume.id + '/file';
        }

        res.render('studentprofile', {
          profile: profile,
          read_experience: read_experience,
          write_experience: write_experience,
          edit_profile: edit_profile,
          company_apply: company_apply,
          notificationlink: notificationlink,
          log_out: log_out,
          applied: applied,
          firstname: student.firstname,
          lastname: student.lastname,
          branch: student.branch,
          degree: student.degree,
          personal_email: student.personal_email,
          grad: student.grad,
          contact_no: student.contact_no,
          cgpa: student.cgpa,
          active_backlogs: student.active_backlogs,
          percent_10: student.percent_10,
          board_10: student.board_10,
          percent_12: student.percent_12,
          board_12: student.board_12,
          address: student.address,
          city: student.city,
          state: student.state,
          country: student.country,
          linkdin: student.linkdin,
          resumeUrl: resumeUrl,
        });
      }
    }
  });
});

//It renderes the experience which are confirmed by the admin
app.get('/:id/experiences', (req, res) => {
  InterviewExp.find({ confirmed: true }, (err, experience) => {
    //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
    const profile = '/student/login/' + req.params.id + '/studentprofile';
    const read_experience = '/student/login/' + req.params.id + '/experiences';
    const write_experience =
      '/student/login/' + req.params.id + '/submitexperience';
    const edit_profile = '/student/login/' + req.params.id + '/editProfile';
    const company_apply = '/student/login/' + req.params.id + '/Company';
    const notificationlink =
      '/student/login/' + req.params.id + '/notifications';
    const applied = '/student/login/' + req.params.id + '/applied';
    const log_out = '/student/login/' + req.params.id + '/logOut';
    if (err) {
      console.log(err);
    } else {
      res.render('Experiences', {
        profile: profile,
        applied: applied,
        read_experience: read_experience,
        write_experience: write_experience,
        notificationlink: notificationlink,
        company_apply: company_apply,
        edit_profile: edit_profile,
        log_out: log_out,
        studentId: req.params.id,
        experience: experience,
      });
    }
  });
});

app.get('/:id/experiences/:experienceId/details', (req, res) => {
  InterviewExp.findById({ _id: req.params.experienceId }, (err, experience) => {
    //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
    const profile = '/student/login/' + req.params.id + '/studentprofile';
    const read_experience = '/student/login/' + req.params.id + '/experiences';
    const write_experience =
      '/student/login/' + req.params.id + '/submitexperience';
    const edit_profile = '/student/login/' + req.params.id + '/editProfile';
    const company_apply = '/student/login/' + req.params.id + '/Company';
    const notificationlink =
      '/student/login/' + req.params.id + '/notifications';
    const applied = '/student/login/' + req.params.id + '/applied';
    const log_out = '/student/login/' + req.params.id + '/logOut';
    if (err) {
      console.log(err);
    } else {
      res.render('experience_det', {
        profile: profile,
        applied: applied,
        read_experience: read_experience,
        write_experience: write_experience,
        notificationlink: notificationlink,
        company_apply: company_apply,
        edit_profile: edit_profile,
        log_out: log_out,
        choice: experience.choice,
        company: experience.company,
        branch: experience.branch,
        exp: experience.exp,
      });
    }
  });
});

//renders the submitting a new experience page
app.get('/:id/submitexperience', (req, res) => {
  //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';
  res.render('submitExp', {
    profile: profile,
    applied: applied,
    read_experience: read_experience,
    write_experience: write_experience,
    notificationlink: notificationlink,
    company_apply: company_apply,
    edit_profile: edit_profile,
    log_out: log_out,
  });
});

//adds the new experience but is not confirmed
app.post('/:id/submitexperience', (req, res) => {
  let company = req.body.companyname;
  let branch = req.body.branch;
  let exp = req.body.experience;
  let choice = req.body.choice;
  let rollno = '';
  Student.findById({ _id: req.params.id }, (err, student) => {
    if (err) {
      return res.json({ msg: 'Something went wrong!' });
    } else {
      if (student) {
        rollno = student.rollno;
        const Experience = new InterviewExp({
          company: company,
          branch: branch,
          exp: exp,
          choice: choice,
          rollno: rollno,
        });
        Experience.save((err) => {
          if (err) {
            console.log(err);
          } else {
            res.redirect('/student/login/' + req.params.id + '/studentprofile');
            // res.send("Experience submitted successfully!. Please wait for the admin to confirm.")
          }
        });
      } else {
        res.send('Something wrong happened');
      }
    }
  });
});

//Renderes the edit profile page with the last given data by the student
app.get('/:id/editProfile', (req, res) => {
  var msg = req.flash('message');
  //profile read_experience write_experience edit_profile are the links given to the buttons on the student profile
  const upload_resume = '/student/login/' + req.params.id + '/uploadResume';
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  //it is for the post button so that app.post works
  const link = '/student/login/' + req.params.id + '/editProfile';
  const change_pswrd = '/student/login/' + req.params.id + '/change_pswrd';
  Student.findById({ _id: req.params.id }, (err, student) => {
    if (err) {
      return res.json({ msg: 'Something went wrong!' });
    } else {
      res.render('editProfile', {
        profile: profile,
        applied: applied,
        read_experience: read_experience,
        write_experience: write_experience,
        notificationlink: notificationlink,
        edit_profile: edit_profile,
        company_apply: company_apply,
        log_out: log_out,
        link: link,
        firstname: student.firstname,
        lastname: student.lastname,
        branch: student.branch,
        degree: student.degree,
        college_id: student.rollno,
        personal_email: student.personal_email,
        grad: student.grad,
        contact_no: student.contact_no,
        cgpa: student.cgpa,
        active_backlogs: student.active_backlogs,
        percent_10: student.percent_10,
        board_10: student.board_10,
        percent_12: student.percent_12,
        board_12: student.board_12,
        address: student.address,
        city: student.city,
        state: student.state,
        country: student.country,
        linkdin: student.linkdin,
        change_pswrd: change_pswrd,
        upload_resume: upload_resume,
        message: msg,
      });
    }
  });
});

app.post('/:id/uploadResume', uploadFile.single('resume'), (req, res) => {
  console.log({ file: req.file });

  Student.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        resume: req.file,
      },
    },
    { new: true },
    (err, student) => {
      if (err) {
        console.log({ err });
        return res.json({ msg: 'Something went wrong!' });
      } else {
        //redirects to student profile
        req.flash('message', 'Resume Changed');
        res.redirect('/student/login/' + req.params.id + '/editProfile');
      }
    }
  );
});

//Changes the data according to the gievn data and redirects the user to his profile
app.post('/:id/editProfile', (req, res) => {
  Student.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        personal_email: req.body.personal_email,
        degree: req.body.degree,
        branch: req.body.branch,
        contact_no: req.body.contact_no,
        cgpa: req.body.cgpa,
        active_backlogs: req.body.active_backlogs,
        percent_10: req.body.percent_10,
        board_10: req.body.board_10,
        percent_12: req.body.percent_12,
        board_12: req.body.board_12,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        linkdin: req.body.linkdin,
        grad: req.body.grad,
      },
    },
    { new: true },
    (err, student) => {
      if (err) {
        return res.json({ msg: 'Something went wrong!' });
      } else {
        res.redirect('/student/login/' + req.params.id + '/studentprofile');
      }
    }
  );
});

app.get('/:id/Company', (req, res) => {
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';
  Student.findById({ _id: req.params.id }, (error, student) => {
    if (error) {
      res.send('Something wrong happened');
    } else {
      Company.find(
        {
          confirmed: true,
          confirmedbyAdmin: true,
          _id: { $nin: student.companies_applied },
        },
        (err, company) => {
          if (err) {
            console.log(err);
          } else {
            res.render('companies', {
              profile: profile,
              applied: applied,
              read_experience: read_experience,
              write_experience: write_experience,
              notificationlink: notificationlink,
              edit_profile: edit_profile,
              company_apply: company_apply,
              studentId: req.params.id,
              log_out: log_out,
              companies: company,
            });
          }
        }
      );
    }
  });
});

app.get('/:id/:companyId/apply', (req, res) => {
  Company.findByIdAndUpdate(
    { _id: req.params.companyId },
    { $push: { students: req.params.id } },
    { new: true },
    (err, c) => {
      if (err) {
        return res.json({ msg: 'Something went wrong!' });
      } else {
        Student.findByIdAndUpdate(
          { _id: req.params.id },
          { $push: { companies_applied: req.params.companyId } },
          { new: true },
          (error, s) => {
            if (error) {
              return res.json({ msg: 'Something went wrong!' });
            } else {
              res.redirect('/student/login/' + req.params.id + '/Company');
              //res.send("Applied!");
            }
          }
        );
      }
    }
  );
});

app.get('/:id/:companyId/details', (req, res) => {
  const companyid = req.params.companyId;
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';
  Company.findById({ _id: companyid }, (error, company) => {
    if (error) {
      console.log(error);
      res.send('Something wrong happened');
    } else {
      res.render('CompanyDetails_stud', {
        profile: profile,
        applied: applied,
        read_experience: read_experience,
        write_experience: write_experience,
        notificationlink: notificationlink,
        edit_profile: edit_profile,
        company_apply: company_apply,
        log_out: log_out,
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
        tentative_joining_date: company.date,
        job_description: company.description,
        eligible_branch: company.eligible_branch,
        min_cgpa: company.min_cgpa,
        min_10_percent: company.min_10_percent,
        min_12_percent: company.min_12_percent,
        package: company.package,
        deadline_date: company.deadline_date.toLocaleString('en-us', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        studentId: req.params.id,
        companyId: companyid,
      });
    }
  });
});

app.get('/:id/applied', (req, res) => {
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';
  Student.findById({ _id: req.params.id }, (error, student) => {
    if (error) {
      console.log(error);
      res.send('Something wrong happened');
    } else {
      Company.find(
        { _id: { $in: student.companies_applied } },
        (err, company) => {
          if (err) {
            console.log(err);
          } else {
            res.render('Applied_companies', {
              profile: profile,
              applied: applied,
              read_experience: read_experience,
              write_experience: write_experience,
              notificationlink: notificationlink,
              edit_profile: edit_profile,
              company_apply: company_apply,
              studentId: req.params.id,
              log_out: log_out,
              companies: company,
            });
          }
        }
      );
    }
  });
});

app.get('/:id/notifications/', (req, res) => {
  const profile = '/student/login/' + req.params.id + '/studentprofile';
  const read_experience = '/student/login/' + req.params.id + '/experiences';
  const write_experience =
    '/student/login/' + req.params.id + '/submitexperience';
  const edit_profile = '/student/login/' + req.params.id + '/editProfile';
  const company_apply = '/student/login/' + req.params.id + '/Company';
  const log_out = '/student/login/' + req.params.id + '/logOut';
  const applied = '/student/login/' + req.params.id + '/applied';
  const notificationlink = '/student/login/' + req.params.id + '/notifications';
  notification.find({}, (err, notices) => {
    if (err) {
      console.log(err);
    } else {
      notices.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });
      res.render('notification_student', {
        profile: profile,
        applied: applied,
        read_experience: read_experience,
        write_experience: write_experience,
        edit_profile: edit_profile,
        company_apply: company_apply,
        notices: notices,
        notificationlink: notificationlink,
        log_out: log_out,
      });
    }
  });
});

app.get('/:id/logOut', (req, res) => {
  res.clearCookie('studentLogin');
  res.redirect('/student/login');
});

module.exports = app;
