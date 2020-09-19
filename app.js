const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Student = require('./model/Student');
const app = express();
const connectdb = require("./config/db");
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

connectdb();

app.get('/' , (req,res) => {
    res.render("opening");
});

app.get('/opening' , (req,res) => {
    res.redirect("/");
});

app.use('/api/studentapi/registerStudent' , require('./routes/api/studentApi/registerStudent'));
app.use('/api/studentapi/loginStudent' , require('./routes/api/studentApi/loginStudent.js'));

app.listen(3000 , () => {
    console.log("Server started on port 3000");
});
