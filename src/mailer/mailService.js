const nodeMailer = require("nodemailer");
const { config } = require("dotenv");
config();
// create a transporter having the credetials of the host mail
let transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAUTH2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

//mailOptions object that holds the data of the mail

exports.sendMail = (message, email) => {
  let mailOptions = {
    to: `${email}, krysnkem@gmail.com`,
    subject: "Testing Nodemailer project",
    text: "Just testing the nodemailder project", // plain text body
    html: `${message}`, // html body
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) console.log(`Error ${err}`);
    else console.log("Email sent sucessfully");
  });
};
