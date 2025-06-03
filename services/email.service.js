const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

const createGmailTransport = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.username,
      pass: config.email.password // This should be your app password, not your regular Gmail password
    }
  });
};

const createCustomTransport = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.username,
      pass: config.email.password
    }
  });
};

const sendEmail = async (options) => {
  // For development environment, always log the email content
  if (config.env === 'development') {
    logger.info('Email content (DEV MODE):', {
      to: options.email,
      subject: options.subject,
      message: options.message
    });
    
    // If email credentials are not configured, return early in development
    if (!config.email.username || !config.email.password) {
      logger.warn('Email credentials not configured. Skipping email send in development.');
      return;
    }
  }

  // Determine which transport to use
  const transporter = config.email.host === 'smtp.gmail.com' 
    ? createGmailTransport()
    : createCustomTransport();

  const message = {
    from: `${config.email.from} <${config.email.username}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // Add HTML version of the email
    html: options.message.replace(/\n/g, '<br>')
  };

  try {
    // Verify transporter configuration
    await transporter.verify();
    
    const info = await transporter.sendMail(message);
    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.email,
      subject: options.subject
    });
  } catch (error) {
    logger.error('Error sending email:', error);
    
    // In development, don't throw error if credentials are not configured
    if (config.env === 'development' && (error.code === 'EAUTH' || error.code === 'ESOCKET')) {
      logger.warn('Email not sent due to configuration issues in development mode');
      return;
    }
    
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail; 