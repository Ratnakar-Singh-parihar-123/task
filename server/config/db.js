import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("Connecting to MongoDB:", process.env.MONGO_URI);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || undefined, 
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,  
    });

    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); 
  }
};

export default connectDB;