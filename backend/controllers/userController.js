import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import { Job } from "../models/jobSchema.js"; // ✅ Used in getPlatformStats

// Utility to store resume locally
const resumeStorageDir = path.join("uploads", "resumes");
const saveResumeLocally = (file) => {
  if (!fs.existsSync(resumeStorageDir)) {
    fs.mkdirSync(resumeStorageDir, { recursive: true });
  }
  const filename = `${uuidv4()}-${file.name}`;
  const filepath = path.join(resumeStorageDir, filename);
  file.mv(filepath); // file from express-fileupload
  return {
    path: filepath,
    url: `/uploads/resumes/${filename}`,
  };
};

// ✅ REGISTER
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!", 400));
  }

  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!", 400));
  }

  let resumeData = { public_id: null, url: null };

  if (role === "Job Seeker" && req.files?.resume) {
    const file = req.files.resume;
    const allowedFormats = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedFormats.includes(file.mimetype)) {
      return next(new ErrorHandler("Invalid resume file format", 400));
    }

    const localFile = saveResumeLocally(file);
    resumeData = {
      public_id: null,
      url: localFile.url,
    };
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    resume: resumeData,
  });

  sendToken(user, 201, res, "User Registered Successfully!");
});

// ✅ LOGIN
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)) || user.role !== role) {
    return next(new ErrorHandler("Invalid credentials!", 401));
  }

  sendToken(user, 200, res, "User Logged In Successfully!");
});

// ✅ LOGOUT
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({ success: true, message: "Logged Out Successfully!" });
});

// ✅ GET LOGGED-IN USER
export const getUser = catchAsyncErrors((req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// ✅ UPLOAD RESUME
export const uploadResume = catchAsyncErrors(async (req, res, next) => {
  const { role, _id } = req.user;
  if (role !== "Job Seeker") {
    return next(new ErrorHandler("Only job seekers can upload resumes", 403));
  }

  if (!req.files?.resume) {
    return next(new ErrorHandler("Resume file is required", 400));
  }

  const file = req.files.resume;
  const allowedFormats = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedFormats.includes(file.mimetype)) {
    return next(new ErrorHandler("Invalid file format", 400));
  }

  const localFile = saveResumeLocally(file);

  const user = await User.findById(_id);
  user.resume = {
    public_id: null,
    url: localFile.url,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Resume uploaded successfully",
    resume: user.resume,
  });
});

// ✅ UPDATE PROFILE
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  const { name, email, phone } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;

  // Resume (Job Seeker only)
  if (user.role === "Job Seeker" && req.files?.resume) {
    const resumeFile = req.files.resume;
    const allowedFormats = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedFormats.includes(resumeFile.mimetype)) {
      return next(new ErrorHandler("Invalid resume file format", 400));
    }

    const localFile = saveResumeLocally(resumeFile);
    user.resume = {
      public_id: null,
      url: localFile.url,
    };
  }

  // Avatar/Profile Image (All users)
  if (req.files?.avatar) {
    const avatarFile = req.files.avatar;
    const allowedImageFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedImageFormats.includes(avatarFile.mimetype)) {
      return next(new ErrorHandler("Invalid profile picture format", 400));
    }

    if (user.avatar?.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const avatarUpload = await cloudinary.uploader.upload(avatarFile.tempFilePath, {
      folder: "profilePictures",
    });

    user.avatar = {
      public_id: avatarUpload.public_id,
      url: avatarUpload.secure_url,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// ✅ GET PLATFORM STATS
export const getPlatformStats = catchAsyncErrors(async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: "Job Seeker" });
    const totalEmployers = await User.countDocuments({ role: "Employer" });

    res.status(200).json({
      success: true,
      totalJobs,
      totalJobSeekers,
      totalEmployers,
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to load stats", 500));
  }
});
