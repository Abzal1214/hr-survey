import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI не задан в .env');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,
    }).then(m => m).catch(err => {
      console.error('Ошибка подключения к MongoDB:', err.message);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
