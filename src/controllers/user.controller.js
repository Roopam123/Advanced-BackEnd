import { asyncHandler } from "../utils/asyncHander.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { fileUploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1. get user details from frontend
  // 2. check validation - any field not a empty
  // 3. check user already register or exist
  // 4. check for img and avatar
  //  5. upload on cloudinary
  // 6. create user object - create object in db
  // 7.  remove password and refresh token from the response
  // 8.  check your creation
  // 9. return res

  //   1. get details from the frontend
  const { username, email, fullName, password } = req.body;
  console.log(username, email, fullName, password);

  // 2. Check for the empty fields
  if (
    [username, email, fullName, password].some((field) => field?.trime() === "")
  ) {
    throw new ApiError(400, "All feilds are required !!");
  }

  // 3. check for the user exist
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  // 4.  check for img and avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const converImgLocalPath = req.files?.coverImg[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //  5. upload on cloudinary
  const avatar = await fileUploadOnClodinary(avatarLocalPath);
  const coverImg = await fileUploadOnClodinary(converImgLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // 6. create user object - create object in db

  const user = await User.create({
    username: username.toLoverCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImg: coverImg.url || "",
  });
  const createdUser = await user
    .findById(user._id)
    .select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
//   return
return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registerd successfully")
)
});

export { registerUser };