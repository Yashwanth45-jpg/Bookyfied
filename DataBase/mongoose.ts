import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

declare global {
  var mongooseCache: {conn : typeof mongoose | null,
    promise: Promise<typeof mongoose> | null};
}

let cached = global.mongooseCache || { conn: null, promise: null }; 

export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {

    cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
    console.log('Connected to MongoDB');
    return cached.conn;

};