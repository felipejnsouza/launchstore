const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "3e9d576cc3a498",
      pass: "040deb8618da91"
    }
  });

