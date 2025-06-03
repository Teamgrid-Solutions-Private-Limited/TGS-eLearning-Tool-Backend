require('dotenv').config();
const sendEmail = require('../services/email.service');

const testEmail = async () => {
  try {
    console.log('Testing Gmail configuration...');
    console.log('Using email settings:');
    console.log('- HOST:', process.env.EMAIL_HOST);
    console.log('- PORT:', process.env.EMAIL_PORT);
    console.log('- USERNAME:', process.env.EMAIL_USERNAME);
    console.log('- FROM:', process.env.EMAIL_FROM);

    // First verify the app password format
    if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD.length !== 16) {
      console.error('Warning: Gmail app password should be exactly 16 characters');
      console.log('Make sure you\'re using the App Password, not your regular Gmail password');
      return;
    }

    await sendEmail({
      email: process.env.EMAIL_USERNAME, // Send to yourself for testing
      subject: 'Gmail Test - TGS eLearning',
      message: `This is a test email from TGS eLearning.
      
Time: ${new Date().toISOString()}
Environment: ${process.env.NODE_ENV || 'development'}

If you receive this email, your Gmail SMTP configuration is working correctly!

Best regards,
TGS eLearning Team`
    });

    console.log('Test email sent successfully! Check your inbox.');
  } catch (error) {
    console.error('Failed to send test email:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure 2-Step Verification is enabled in your Google Account');
    console.log('2. Use an App Password, not your regular Gmail password');
    console.log('3. The App Password should be 16 characters (no spaces)');
    console.log('4. Check if your Google Account has any security restrictions');
  } finally {
    process.exit();
  }
};

testEmail(); 