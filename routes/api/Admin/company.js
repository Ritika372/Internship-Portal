const bodyparser = require("body-parser");
const Company = require('../../../model/Company');
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/' , (req,res) => {
    Company.find({confirmed: true,confirmedbyAdmin: false} , (err,company) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("company_admin" , {companies: company});
        }
    });
});
app.post('/confirmcompany', (req,res) => {
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
            res.render("company_admin" , {companies: company});
        }
    });
       }
   });
   

});
app.post('/deletecompany', (req,res) => {
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
          res.render("company_admin" , {companies: company});
          }
          });
       }
   });
   

});














module.exports = app;