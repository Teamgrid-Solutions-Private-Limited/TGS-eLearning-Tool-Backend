require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/role.model');

const getRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
    const roles = await Role.find().select('_id name description');
    console.log('Available Roles:');
    console.log(JSON.stringify(roles, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

getRoles(); 