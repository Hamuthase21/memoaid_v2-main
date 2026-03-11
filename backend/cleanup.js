import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/memoaid');
    console.log('✅ Connected');

    console.log('🗑️  Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped successfully');

    await mongoose.disconnect();
    console.log('✅ Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

dropDatabase();
