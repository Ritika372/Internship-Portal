const bodyparser = require("body-parser");
const InterviewExp = require('../../../model/Interview');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/' , (req,res) => {
    InterviewExp.find({confirmed: true} , (err,experience) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("Experiences" , {experience: experience});
        }
    });
});
module.exports = app;