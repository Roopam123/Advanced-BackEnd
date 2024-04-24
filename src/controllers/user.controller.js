import { json } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";
import { fileUploadOnClodinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // 1. get details from the FrontEnd
  // 2. validation - not shuld be empty
  // 3. check your already registerd or not by username,email
  // 4. check for cover img and avatar
  // 5. upload them on cloudinary,avtar
  // 6. create object of the data and create entry on the database
  // 7. remove password and refresh token field form the response
  // 8. check for user creation
  // 9. return res

  // 1. get details from the Frontend
  const { username, email, fullName, password } = req.body;
  console.log(username, email, fullName, password);
  // 2. validation - not shuld be empty
  if (username === "" || email === "" || fullName === "" || password === "") {
    throw new ApiError(400, "All feilds are mandentory!!");
  }

  // 3. check the user already exist or not
  const checkUserExist = User.findOne({
    $or: [{ email }, { password }],
  });
  if (checkUserExist) {
    throw new ApiError(409, "User Allready Exist");
  }

  // 4. check for cover img and avatar
  console.log(req.files);
  const avtarLocalPath = req.files?.avatar[0]?.path;
  const coverImgLocalPath = req.files?.coverImage[0]?.path;
  if (!avtarLocalPath) {
    throw new ApiError(400, "Avatar files is requred !!!");
  }

  // 5. upload them on cloudinary,avtar
  const avatar = await fileUploadOnClodinary(avtarLocalPath);
  const coverImg = await fileUploadOnClodinary(coverImgLocalPath);
  if (!avatar) {
    throw new ApiError(
      400,
      "Avatar files is requred on upload on cloudinary !!!"
    );
  }
  // 6. create object of the data and create entry on the database
  const user = await User.create({
    fullName,
    avatar: avatar?.url,
    coverImage: coverImg?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // 7. remove password and refresh token field form the response
  //   -password means ye filed ko chhod kar baki sab aa jao
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  // 8. check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Internal Server Error");
  }
  return res.status(201),json(
    new ApiResponse(200,createdUser,"User Registerd Successfully!!")
  )
});

export { registerUser };
