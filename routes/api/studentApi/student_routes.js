const express = require("express");
const bodyparser = require("body-parser");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use('/login' , require('./loginStudent'));
app.use('/forgot_pass' , require('./forgotpassword'));
app.use('/register' , require('./registerStudent'));
module.exports = app;