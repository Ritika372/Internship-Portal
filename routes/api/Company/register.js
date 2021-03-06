const bodyparser = require('body-parser');
const Company = require('../../../model/Company');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const sendemails = require('./email');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
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

//Renders the starting register page
app.get('/', (req, res) => {
  res.render('registerComp');
});

//Saving the initial data of the company
app.post('/', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let companyname = req.body.companyname;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    const newCompany = new Company({
      companyname: companyname,
      email: email,
      password: hash,
    });
    newCompany.save((err, resp) => {
      if (err) {
        console.log(err);
      } else {
        //import jwt from 'jsonwebtoken';
        const expiration = 604800000;
        const id = newCompany._id;
        const token = jwt.sign({ id, password }, 'rohitMittalisthebest', {
          expiresIn: '7d',
        });
        const msg =
          'Thanks for Registering With us .Please Click on the given button to register';
        //const link = 'http://localhost:3000/company/register/confirm/' + token;
        const link =
          'https://careerservices.herokuapp.com/company/register/confirm/' +
          token;
        sendemails(email, link, msg);
        res.redirect('/company/register/' + newCompany._id + '/enterdetails');
      }
    });
  });
});

const verify = async (req, res) => {
  const token = req.params.token || '';
  try {
    if (!token) {
      return res.send('Wrong Link ');
    }
    const decrypt = await jwt.verify(token, 'rohitMittalisthebest');
    Company.findByIdAndUpdate(
      { _id: decrypt.id },
      {
        $set: { confirmed: true },
      },
      { new: true },
      (err, student) => {
        if (err) {
          return res.json({ msg: 'Something went wrong!' });
        } else {
          return res.json({ msg: 'Confirmed!' });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.json({ msg: 'Something went wrong!' });
  }
};

app.get('/confirm/:token', verify);

//Renders the enterdetails page with the email rollno according to saved data
app.get('/:id/enterdetails', (req, res) => {
  //link given the direction so that post button works
  const link = '/company/register/' + req.params.id + '/enterdetails';
  Company.findById({ _id: req.params.id }, (err, company) => {
    if (err) {
      console.log({ error: err });
      return res.json({ msg: 'Something went wrong-1!' });
    } else {
      res.render('enterDetailsComp', {
        link: link,
        companyname: company.companyname,
      });
    }
  });
});

//saves the data of the user
app.post('/:id/enterdetails', (req, res) => {
  Company.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        companyname: req.body.companyname,
        website: req.body.website,
        org_type: req.body.org_type,
        about_company: req.body.about_company,
        job_profile: req.body.job_profile,
        batch: req.body.batch,
        recruitment: req.body.recruitment,
        duration: req.body.duration,
        industry_sector: req.body.industry_sector,
        location: req.body.location,
        date: req.body.date.toLocaleString('en-us', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        description: req.body.description,
        eligible_prog: req.body.eligible_prog,
        eligible_branch: req.body.eligible_branch,
        min_cgpa: req.body.min_cgpa,
        min_10_percent: req.body.min_10_percent,
        min_12_percent: req.body.min_12_percent,
        medical_requirement: req.body.medical_requirement,
        package: req.body.package,
        company_accommodation: req.body.company_accommodation,
        other_facility: req.body.other_facility,
        deadline_date: req.body.deadline_date.toLocaleString('en-us', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    },
    { new: true },
    (err) => {
      if (err) {
        return res.json({ msg: 'Something went wrong!' });
      } else {
        //redirects to Company profile
        res.redirect('/company/login/' + req.params.id + '/companyprofile');
      }
    }
  );
});

module.exports = app;
