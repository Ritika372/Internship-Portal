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
    InterviewExp.find({confirmed: false} , (err,experience) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("exp_admin" , {experience: experience});
        }
    });
});
app.post('/confirmexp', (req,res) => {
    console.log(req.body.id);
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
                res.render("exp_admin" , {experience: experience});
            }
           });
       }
   });
   

});
app.post('/deleteexp', (req,res) => {
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
                res.render("exp_admin" , {experience: experience});
            }
           });
       }
   });
   

});














module.exports = app;