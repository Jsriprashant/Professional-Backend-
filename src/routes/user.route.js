import { Router } from "express";
import { loginUser, registerUser, logoutUser, newAcessToken } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()


// router.route("/register").post(registerUser)

router.route("/register").post(
    // as before register user hits we need a middleware to handle the incoming files, so we use this upload just before the registerUser
    upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),

    registerUser

)

router.route("/login").post(loginUser)


// Secured Routes
// we run this verify jwt middle ware that takes incoming request and verifies the user through cookies and in the request add a object with the decoded user detail and pass it to the next 
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/newAcessToken").post(newAcessToken)
export default router