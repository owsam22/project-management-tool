import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/scpm';
    await mongoose.connect(mongoURI);
    console.log('[SCPM] Connected to MongoDB');
  } catch (error) {
    console.error('[SCPM] MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
