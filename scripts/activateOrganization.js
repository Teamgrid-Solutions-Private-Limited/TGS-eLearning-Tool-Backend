require('dotenv').config();
const mongoose = require('mongoose');
const Organization = require('../models/organization.model');

const activateOrganizations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    const result = await Organization.updateMany({}, { isActive: true });
    console.log(`Updated ${result.modifiedCount} organizations`);
    
    // Print all organizations and their active status
    const orgs = await Organization.find({}, 'name isActive');
    console.log('\nOrganization Status:');
    orgs.forEach(org => {
      console.log(`- ${org.name}: ${org.isActive ? 'Active' : 'Inactive'}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

activateOrganizations();
