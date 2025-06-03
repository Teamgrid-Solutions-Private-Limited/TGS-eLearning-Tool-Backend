require('dotenv').config();
const mongoose = require('mongoose');
const seedRoles = require('../config/seeders/roleSeeder');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const runSeeder = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Run the seeder
    await seedRoles();

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

runSeeder(); 