require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/organization.model');
const User = require('../models/user.model');

const checkStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    // Find user and their organization
    const user = await User.findOne({ email: 'silpi.mandal@teamgrid.io' })
      .populate('organization');
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('\nUser details:');
    console.log('- Email:', user.email);
    console.log('- Organization ID:', user.organization._id);
    console.log('- Organization Name:', user.organization.name);
    console.log('- Organization Active Status:', user.organization.isActive);
    
    // Double check the organization directly
    const org = await Organization.findById(user.organization._id);
    console.log('\nDirect organization check:');
    console.log('- Organization ID:', org._id);
    console.log('- Organization Name:', org.name);
    console.log('- Organization Active Status:', org.isActive);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

checkStatus();
