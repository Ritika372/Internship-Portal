const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Student = require('./model/Student');
const app = express();
const connectdb = require("./config/db");
const bcrypt = require("bcrypt");
const { createGridFSReadStream, getGridFSFiles } = require('./config/db');
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

app.get('/:id/file', async (req, res) => {
    console.log(req.params.id);
    try {
        const file = await getGridFSFiles(req.params.id);
        res.setHeader("content-type", file.contentType);
        const readStream = createGridFSReadStream(req.params.id);
        readStream.pipe(res);
    }catch(error) {
        console.log(error);
        res.status(404).send({ message: "file not found" });
    }   
})


app.use('/student' , require('./routes/api/studentApi/student_routes'));
app.use('/admin',  require('./routes/api/Admin/admin_routes'));
app.use('/company', require('./routes/api/Company/company_routes'));

app.listen(3000 , () => {
    console.log("Server started on port 3000");
});
