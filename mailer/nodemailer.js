const nodemailer = require("nodemailer");
require("dotenv").config();

const createAndSendEmail = async (opts) => {
  let response = undefined;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  });
  const mailOpts = {
    from: process.env.MAILER_USER,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  };

  response = await transporter.sendMail(mailOpts);
  return response;
};

module.exports = createAndSendEmail;
