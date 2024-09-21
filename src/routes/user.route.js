import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middleware.js"

const router = Router()


// router.route("/register").post(registerUser)

router.route("/register").post(
    // as before register user hits we need a middleware to handle the incoming files, so we use this upload just before the registerUser
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
    registerUser

)
export default router