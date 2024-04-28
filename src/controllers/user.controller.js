import { json } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";
import { fileUploadOnClodinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // add refresh token on the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access and refresh token !!"
    );
  }
};

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
  // 2. validation - not shuld be empty
  if (username === "" || email === "" || fullName === "" || password === "") {
    throw new ApiError(400, "All feilds are mandentory!!");
  }

  // 3. check the user already exist or not
  const checkUserExist = await User.findOne({
    $or: [{ email }, { password }],
  });
  if (checkUserExist) {
    throw new ApiError(409, "User Allready Exist");
  }

  // 4. check for cover img and avatar
  console.log("File", req.files);
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

  // Use proper syntax for chaining method calls and invoking status function
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully!!"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  // 1. req body -> data
  // 2. login with username or email
  // 3. find the user
  // 4. check the password
  // 5. the refresh token and access token
  // 6. send the cookies and massage

  // 1. req body -> data
  const { email, username, password } = req.body;
  if (!(email || username)) {
    throw new ApiError(400, "username or password is required!!");
  }

  // when we want to connect with the our database we need use the await
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user || !email) {
    throw new ApiError(404, "User does not exist!!");
  }
  // check the password

  const isPasswordValid = await user.isPasswordCurrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect !!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loginUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loginUser, accessToken, refreshToken },
        "User login successfully"
      )
    );
});

const logOut = asyncHandler(async (req, res) => {
  User.findByIdAndDelete(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200)
  .clearCookie("accessToken", accessToken, options)
  .clearCookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200,{},"User logout successfully"))
});

export { registerUser, loginUser, logOut };
