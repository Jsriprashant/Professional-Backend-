import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Certificate: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import userRouter from './routes/user.route.js'


// Routes declaration
// app.use("/users", userRouter)
// now ab koi bhi type karega /users then control chala jayega user.route.js wale file pe
app.use("/api/v1/users", userRouter)

export { app }