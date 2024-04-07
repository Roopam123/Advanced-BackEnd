import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log(`successfully database connected!!`);
  } catch (error) {
    console.log("Mongodb connection faild at db", error);
    process.env(1);
  }
};

export default connectDB;
