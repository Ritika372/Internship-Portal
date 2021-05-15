const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
require("dotenv").config();

const sendMails = (email, subject, text, msg, link_name) => {
  var transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDMAIL,
      pass: process.env.SENDPASS,
    },
  });
  console.log("hrrr");
  console.log(text);
  ejs.renderFile(
  
    path.join(__dirname + "../../../../views/confirmationMail.ejs"),
    { confirmation_link: text, msg: msg, link_name: link_name },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        var mainOptions = {
          from: "Career Services <careerservicesnitj@gmail.com>",
          to: email,
          subject: subject,
          html: data,
        };
        transporter.sendMail(mainOptions, function (err, info) {
          if (err) {
            console.log(err);
          } else {
            console.log("Message sent: " + info.response);
          }
        });
      }
    }
  );
};
module.exports = sendMails;
