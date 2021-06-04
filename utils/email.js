const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) create a transporter

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOpts = {
    from: 'efeidukpaye@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html
  };

  // 3)send the actual email
  await transport.sendMail(mailOpts);
};

module.exports = sendEmail;
