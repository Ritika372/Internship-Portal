const express = require("express");
const bodyparser = require("body-parser");
const app = express();
require('dotenv').config();
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get('/' , (req,res) => {
    res.render('loginAdmin');
});

app.post('/' , (req,res)=> {
    console.log(process.env.EMAIL);
    if(req.body.emailAdmin === process.env.EMAIL && req.body.passAdmin === process.env.PASS){
        res.render('adminHome');
    }
    else{
        res.json({msg : "Incorrect pass or email"});
    }
});

module.exports = app;