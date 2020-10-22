const nodemailer = require('nodemailer');
const ejs =require("ejs");
require('dotenv').config();
const sendMails = (email, text) =>{

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SENDMAIL,
          pass: process.env.SENDPASS
        }
      });

      /*Please set the right path I dont know how to do */
     ejs.renderFile('C:\\Users\\rohit\\Downloads\\Internship-Portal-master3\\Internship-Portal-master\\views\\confirmationMail.ejs',{confirmation_link:text} ,function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: process.env.SENDMAIL,
                to: email,
                subject: 'Verifying Your registration',
                html: data
            };
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }
        
        });
     
     

};
module.exports = sendMails ;



