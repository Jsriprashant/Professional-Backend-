import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        // console.log("access token", accessToken)
        // console.log("refreshToken ", refreshToken)

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access token and refresh token ");

    }
}


// REGISTER THE USER
const registerUser = asyncHandler(
    async (req, res) => {
        // Get User details from the frontend
        // check if any field is empty
        // check if user already exists
        // check for images i.e.avatar
        // if available then upload it in cloudinary
        // create a user object and make a entry in DB
        // remove password and refresh token from the response
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

        if ([email, username, fullname, password, refreshToken].some((field) =>
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

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new apiError(409, "User already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path
        // const coverImageLocalPath = req.files?.coverImage[0]?.path
        let coverImageLocalPath;


        if (!avatarLocalPath) {
            throw new apiError(400, "Avatar is required")
        }

        // check if cover image is uploaded ot not

        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        // Upload on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!avatar) {
            console.log("in the controller file", avatar)
            throw new apiError(400, "Avatar is required");

        }

        const user = await User.create({
            fullname,
            email,
            username: username.toLowerCase(),
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            password,
            refreshToken
        })

        // now to know if the user has been created or not in the DB we are going to make another call to DB

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

// USER LOGIN
const loginUser = asyncHandler(
    async (req, res) => {
        // steps
        // Take the Data from req.body
        // find the user (through username or email)
        // match the passwords(if user is found)
        // generate the access and refresh tokens (if the passowrds match)
        // send the access tokens through cookies(secure cookies)
        // send the acknowledgement that the user is logged in

        const { username, email, password } = req.body


        const user = await User.findOne(
            {
                $or: [{ username }, { email }]
            }
        )
        // console.log("reached here", user)
        if (!user) {
            throw new apiError(404, "User with the username or email not found");

        }

        const isMatch = await user.isPasswordCorrect(password)

        if (!isMatch) {
            throw new apiError(401, "Password entered is incorrect");

        }

        // separate method created above
        // const accessToken = await user.generateAccessToken()
        // const refreshToken = await user.generateRefreshToken()

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)


        // now the user that we queried by findone is nt updated as after that we have generated the refresh tokens and updated the user and also it has all fields like password, tokens, which should not be sent to the front end
        //so we make a mongoDb call again

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        // Creating options for cookies

        const options = {
            httpOnly: true,
            secure: true
        }

        // now in the response we are setting cookies

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
            new apiResponse(200, {
                user: loggedInUser,
                refreshToken: refreshToken,
                accessToken: accessToken
                // now why we are sending the accessToken and refrsh token in json? as we have already did it in cookies
                // its because we aer handleing the case when user wants to save the accessToken and the refresh token in local storage (maybe the user is developing a mobile application so there is no cookies  )
            }, "User logged in Sucessfully")
        )



    }
)

// USER LOGOUT
const logoutUser = asyncHandler(async (req, res) => {

    console.log("username", req.user.username)
    await User.findByIdAndUpdate(
        req.user._id,
        // as from the middle ware (verifyJWT we have embeded a user object in the request)
        {

            $set: { refreshToken: null }
            // we are using the set operator to the set the refresh token as undefined

        },
        {
            new: true
            // by this, when we send the response then we will get the new and updated value not the old one
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("refreshToken", options).clearCookie("accessToken", options).json(new apiResponse(200, {}, "User logged out sucessfully"))

})

// GENERATE NEW ACCESS TOKENS
const newAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;



    if (!incomingRefreshToken) {
        throw new apiError(401, "Not authorised to login")
    }

    try {
        const decoded_user = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decoded_user) {
            throw new apiError(400, "invalid refresh token")
        }

        const user = await User.findById(decoded_user?._id);

        if (!user) {
            throw new apiError(401, "invalid refresh token");
        }

        // check the refreshtoken

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token expired or used");
        }

        // generate the new refresh tokens

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        const newRefreshToken = refreshToken

        // console.log("accessToken ", accessToken);
        // console.log("refreshToken", newRefreshToken)
        // send new cookies with updated refresh token and accessToken

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
            new apiResponse(
                200,
                {
                    accessToken: accessToken,
                    refreshToken: newRefreshToken
                },
                "New access token generated sucessfully"
            )

        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")

    }



})

// CHANGE CURRENT PASSWORD

const changeOldPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (oldPassword === newPassword) {
        throw new apiError(400, "old password and new password are same, change it !");
    }

    const userId = req.user?._id;

    if (!userId) {
        throw new apiError(400, "Login to change your password");
    }

    const user = await User.findById(userId);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Incorrect Password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new apiResponse(
        200,
        {},
        "Password change sucessfully"
    ))


})

// FETCH CURRENT USER

const fetchCurrentUser = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    if (!userId) {
        throw new apiError(400, "Login first");

    }

    const currentUser = await User.findById(userId);

    return res.status(200).json(200, currentUser, "Current user fetched sucessfully")


})

// UPDATE ACCOUNT

const updateAccountDetails = asyncHandler(async (req, res) => {

    const { email, fullname } = req.body;

    if (!email || !fullname) {
        throw new apiError(400, "All fields are required")
    }

    // using middleware verifyJWT
    const user = await User.findById(req.user._id);

    if (email == user.email) {
        throw new apiError(401, "Email is Same")
    }

    if (fullname == user.fullname) {
        throw new apiError(401, "Fullname is same")
    }

    const updatedUser = await User.findOneAndUpdate(
        user._id,
        {
            $set: { username: username, email: email }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new apiResponse(200, { updatedUser }, "User updated sucessfully")
    )


})

const updateAvatar = asyncHandler(async (req, res) => {
    const user = req.user?._id;
    if (!user) {
        throw new apiError(401, "User authentication failed or user not registered")

    }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is missing");
    }

    const newAvatarUrl = await uploadOnCloudinary(avatarLocalPath);

    if (!newAvatarUrl.url) {
        throw new apiError(400, "Error while uploading on cloudinary");
    }

    await cloudinary.v2.uploader.destroy(user.avatar, { resource_type: 'image' })

    // findoneandupdate, findByidandupdate
    const updatedAvatarUser = await user.findOneAndUpdate(
        user._id,
        {
            $set: { avatar: newAvatarUrl.url }

        },
        {
            new: true
        }).select("-password -refreshToken")

    return res.status(200).json(new apiResponse(200, updatedAvatarUser, "Avatar updated sucessfully"))
})

// exra thing that i did was to delete the old file from cloudinary for avatar and coverimage

const updateCoverImage = asyncHandler(async (req, res) => {
    const user = req.user?._id;
    if (!user) {
        throw new apiError(401, "User authentication failed or user not registered")

    }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError(400, "Cover image file is missing");
    }

    const newCoverUrl = await uploadOnCloudinary(coverImageLocalPath);

    if (!newCoverUrl.url) {
        throw new apiError(400, "Error while uploading on cloudinary");
    }

    await cloudinary.v2.uploader.destroy(user.coverImage, { resource_type: 'image' })

    // findoneandupdate, findByidandupdate
    const updatedCoverUser = await user.findOneAndUpdate(
        user._id,
        {
            $set: { coverImage: newCoverUrl.url }

        },
        {
            new: true
        }).select("-password -refreshToken")

    return res.status(200).json(new apiResponse(200, updatedCoverUser, "Cover Image updated sucessfully"))
})
export { registerUser, loginUser, logoutUser, newAccessToken, changeOldPassword, fetchCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage }