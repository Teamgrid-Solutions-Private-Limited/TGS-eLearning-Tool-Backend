const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.username,
      pass: config.email.password
    }
  });

  const message = {
    from: `${config.email.from} <${config.email.username}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  try {
    const info = await transporter.sendMail(message);
    logger.info('Email sent successfully', info);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail; 