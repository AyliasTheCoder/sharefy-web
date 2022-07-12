const nodemailer = require("nodemailer");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// require("./index");
// let mailTransporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMPASS,
//   },
// });

var mailTransporter = nodemailer.createTransport({
  service: "Yandex",
  auth: {
    user: "sharefyapp@yandex.com",
    pass: "Ninjakid!",
  },
});

function sendEmail(target, name, link) {
  let mailDetails = {
    from: `${name} @ Sharefy`,
    to: target,
    subject: `Sharefy Link from ${name}`,
    text: link,
    // html: fs
    //   .readFileSync("./email.html")
    //   .toString()
    //   .replace("inserthref", link),
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    console.log(err);
    console.log(data);
  });
}

module.exports = sendEmail;
