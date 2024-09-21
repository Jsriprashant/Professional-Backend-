import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(
    async (req, res) => {
        //    Get User details from the frontend
        // check if any field is empty
        // check if user already exists
        // check for images, avatar
        // if available then upload it in cloudinary
        //create a user object and make a entry in DB
        //remove password and refresh token from the response
        // check for user creation
        // return res if user created sucessfully

        const { email, username, fullname, password, refreshToken } = req.body

        //destructured the data from recieved from the front end.
        console.log(email)
        // validations
        // we can use if else for this 
        // if(username===""){
        //     throw new apiError(400,"Full name is required")

        // }

        // either we can write the if statemesnts for every field 
        // or we can use the below method
        if ([email, username, fullname, passoword, refreshToken].some((field) =>
            field?.trim() === ""
        )) {
            throw new apiError(400, "All fields are required")
        }

        // we can do this or
        // const existedUser = User.findOne({
        //     email
        // })

        // we want to check if the username or email is present, if yes then return error
        // ?we can se operators for it 

        const existedUser = User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new apiError(409, "User already exists")
        }

        const avatarLocalPath = res.files?.avatar[0]?.path
        const coverImageLocalPath = res.files?.coverImage[0]?.path

        if (!avatarLocalPath) {
            throw new apiError(400, "Avatar is required")
        }

        // Upload on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            throw new apiError(400, "Avatar is required");

        }

        const user = await User.create({
            fullname,
            email,
            username: username.to_lowercase(),
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            password,
            refreshToken
        })

        // now to know if the user has been created or not in the BD we are going to make another call to DB

        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        // now we do not want to show the password and refresh token to the user, so either we remove it from the user.create 
        // or we can use this .select in this function we pass the fields which we want to exclude with a - symbol  

        if (!createdUser) {
            throw new apiError(500, "something went wrong while registering the user")
        }

        // now we have to send the response 
        // we will use our apiResponse so that properly structured response is sent everytime

        return res.status(201).json(
            new apiResponse(200, createdUser, "User registered Sucessfully")
        )




    })

export { registerUser }