// require('dotenv').config({path: './env'})
// "./" home directory ke andar hi env hai
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDb from "./db/index.js"; 
import dotenv from 'dotenv'

dotenv.config({path:'./'})

connectDb()







// import express from "express"
// const app = express()

//     // this is a iife function--> automatically invoked as soon as it is defined
//     // its good to put semicolon at the start of iife 
//     ; (async () => {
//         try {
//             await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             // if the connection is sucessful
//             // then we put error listners as sometimes express may not be able to respond.
//             app.on('error', (error) => {
//                 console.log("ERROR", error)
//                 throw error
//             })

//             // if everything is fine then we initialise the server listner
//             app.listen(process.env.PORT, () => {
//                 console.log(`The server is listning on PORT:${process.env.PORT} `)
//             })


//         } catch (error) {
//             console.error("ERROR: ", error);
//             throw error

//         }

//     })()