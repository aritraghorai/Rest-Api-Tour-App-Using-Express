const nodemailer = require('nodemailer');
const sentEmail = async (options) => {
  //*1)Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASWORD,
    },
  });
  //*2)Define The email
  const mailOption = {
    from: 'Aritra Ghorai <hellow@aritraghorai.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //*3)Actually sent the email
  await transporter.sendMail(mailOption);
};

module.exports = sentEmail;
