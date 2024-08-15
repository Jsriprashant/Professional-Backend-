// require('dotenv').config({path: './env'})
import connectDb from "./db/index.js";
import express from 'express'
import dotenv from 'dotenv'
dotenv.config({ path: './env' })

const app = express()

connectDb()
    .then(() => {

        app.on('error', (error) => {
            console.log("Error while starting the server : ", error)
            process.exit(1)

        })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`App listning on port ${process.env.PORT || 8000}`)

        })
    })
    .catch((error) => {
        console.error("MONGO DB CONNECTION ERROR: ", error);
    })


















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