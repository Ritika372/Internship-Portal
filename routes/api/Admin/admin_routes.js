const express = require("express");
const bodyparser = require("body-parser");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.use('/login' , require('./loginAdmin'));
app.use('/confirmexp' , require('./confirmexp'));
app.use('/deleteexp' , require('./deleteexp'));
module.exports = app;