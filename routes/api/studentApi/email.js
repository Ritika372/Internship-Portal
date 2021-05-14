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

  ejs.renderFile(
    path.join(__dirname + "../../../../views/confirmationMail.ejs"),
    { confirmation_link: text, msg: msg, link_name: link_name },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        var mainOptions = {
          from: "Ritika Goyal <ritikag.cs.18@nitj.ac.in>",
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

// const sendEmail = async (options) => {
//   //1.) create transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });

//   //2.)define email options
//   const mailOptions = {
//     from: 'Ritika Goyal <ritika@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //html
//   };

//   //3.) activate send the email
//   await transporter.sendMail(mailOptions);
// };
