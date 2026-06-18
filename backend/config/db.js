const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shopez';

    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      console.log('Local MongoDB not running/configured. Starting MongoMemoryServer (version 5.0.26)...');
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '5.0.26'
        }
      });
      mongoUri = mongoServer.getUri();
      console.log(`MongoMemoryServer started successfully: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
