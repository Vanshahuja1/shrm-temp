const nodemailer = require("nodemailer");
require('dotenv').config();
const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendMail({ from, to, cc, subject, text, html }) {
  const mailOptions = {
    from: from || process.env.EMAIL_USER,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    text,
    html,
  };

  // Add CC if provided
  if (cc && Array.isArray(cc) && cc.length > 0) {
    mailOptions.cc = cc.join(', ');
  } else if (cc && typeof cc === 'string') {
    mailOptions.cc = cc;
  }

  return transporter.sendMail(mailOptions);
}

module.exports = sendMail;