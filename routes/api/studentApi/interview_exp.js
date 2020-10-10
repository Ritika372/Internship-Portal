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
    res.send("Welcome to expereinces");
    InterviewExp.find({confirmed: true} , (err,experience) => {
        if(err){
            console.log(err);
        }
        else{
            res.send(experience);
        }
    });
});
module.exports = app;