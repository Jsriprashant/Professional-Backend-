import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const connectionObject = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`Connected Sucessfully on host ${connectionObject.connection.host}`)

    } catch (error) {
        console.error("MongoDb connection Error :", error);

    }
}

export default connectDb