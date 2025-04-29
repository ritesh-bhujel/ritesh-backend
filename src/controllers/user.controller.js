import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    
const {userName, email, fullName, password, } = req.body
console.log("Email: ", email)

if(
[userName, email, fullName, password].some((field) => field?.trim()=== "")
){
    throw new ApiError(400, "All fields are required")
}

const existedUser = User.findOne({
    $or: [{userName}, {email}]
})

if(existedUser){
    throw new ApiError(400, "User already exists")
}

const avatarLocalPath = req.files?.avatar[0].path;
const coverImageLocalPath = req.files?.coverImage[0].path;

if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400, "Avatar upload failed")
}

 const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
})

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500, "User creation failed")
}

return res.status(201).json(
    new ApiResponse(201, createdUser, "User Registered successfully")
)

})

export {registerUser}
