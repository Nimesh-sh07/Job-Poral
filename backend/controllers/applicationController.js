// controllers/applicationController.js
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";

const saveFileLocally = (file) => {
  // return { uploadPath, publicUrl } after saving
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(file.name) || "";
      const baseName = path.basename(file.name, ext).replace(/\s+/g, "-");
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `${baseName}-${uniqueSuffix}${ext}`;
      const uploadPath = path.join(uploadsDir, filename);

      // express-fileupload's mv uses callback style
      file.mv(uploadPath, (err) => {
        if (err) return reject(err);
        // public url - assuming you serve /uploads statically from server
        const publicUrl = `/uploads/${filename}`;
        resolve({ uploadPath, publicUrl, filename });
      });
    } catch (err) {
      reject(err);
    }
  });
};

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  console.log("POST /application/post called");
  console.log("postApplication called");
  console.log("User info from req.user:", req.user);
  console.log("Files received:", req.files);
  console.log("Body received:", req.body);
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }

  // Decide resume source:
  // 1) uploaded file in `req.files.resume`
  // 2) or profile resume in req.user.resume (if user already uploaded resume earlier)
  const hasUploadedFile = req.files && req.files.resume;
  const hasProfileResume = req.user && req.user.resume && req.user.resume.url;

  if (!hasUploadedFile && !hasProfileResume) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const allowedFormats = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf", // allow PDF resumes as well
  ];

  let resumeFile = null;
  if (hasUploadedFile) {
    resumeFile = req.files.resume;
    if (!allowedFormats.includes(resumeFile.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. Please upload PNG, JPEG, WEBP, or PDF.", 400)
      );
    }
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;

  if (!jobId) return next(new ErrorHandler("Job not found!", 404));
  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) return next(new ErrorHandler("Job not found!", 404));

  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };

  if (!name || !email || !coverLetter || !phone || !address) {
    return next(new ErrorHandler("Please fill all fields.", 400));
  }

  try {
    // We'll populate these values either from Cloudinary response or local fallback
    let cloudinaryResponse = null;
    let parsedResumeData = null;
    let fitScore = 0;

    // ---------- HANDLE UPLOADED FILE ----------
    if (hasUploadedFile) {
      // Try Cloudinary upload if configured; if it fails, fallback to local save
      try {
        // prefer cloudinary.v2 uploader if available, but use whichever is configured
        const uploader =
          (cloudinary && cloudinary.uploader) ||
          (cloudinary && cloudinary.v2 && cloudinary.v2.uploader);

        if (uploader) {
          // If the file middleware provides a temporary path (useTempFiles), use it for faster upload
          // Otherwise fallback to buffer-based uploading to Cloudinary is possible but depends on config.
          const uploadOptions = { resource_type: "auto" };
          if (resumeFile.tempFilePath) {
            cloudinaryResponse = await uploader.upload(resumeFile.tempFilePath, uploadOptions);
          } else {
            // If tempFilePath not available, upload from buffer using data URI approach
            // fallback: save locally then upload
            try {
              const { uploadPath } = await saveFileLocally(resumeFile);
              cloudinaryResponse = await uploader.upload(uploadPath, uploadOptions);
              // optionally delete local file after successful upload
              try { fs.unlinkSync(uploadPath); } catch (e) { /* ignore */ }
            } catch (innerErr) {
              // let outer catch handle fallback
              cloudinaryResponse = null;
            }
          }
        }
      } catch (cloudErr) {
        console.error("Cloudinary upload failed (falling back to local):", cloudErr.message || cloudErr);
        cloudinaryResponse = null;
      }

      // If Cloudinary is not available or failed, save locally and set a pseudo-cloudinaryResponse
      let localSaved = null;
      if (!cloudinaryResponse) {
        try {
          localSaved = await saveFileLocally(resumeFile);
          cloudinaryResponse = {
            public_id: null,
            secure_url: localSaved.publicUrl, // e.g. /uploads/filename.ext
          };
        } catch (saveErr) {
          console.error("Local save failed:", saveErr);
          return next(new ErrorHandler("Failed to save resume file", 500));
        }
      }

      // ---------- Resume Parser Call ----------
      try {
        const axios = await import("axios").then((mod) => mod.default);
        const FormData = await import("form-data").then((mod) => mod.default);
        const parserForm = new FormData();

        // Prefer buffer if available (express-fileupload provides `data` buffer)
        if (resumeFile.data) {
          parserForm.append("file", resumeFile.data, resumeFile.name);
        } else if (cloudinaryResponse && typeof cloudinaryResponse.secure_url === "string" && cloudinaryResponse.secure_url.startsWith("/uploads/")) {
          // if we stored locally and only have the local path, pass file stream
          const localPath = path.join(process.cwd(), cloudinaryResponse.secure_url);
          if (fs.existsSync(localPath)) {
            parserForm.append("file", fs.createReadStream(localPath));
          }
        }

        // Call parser if we appended a file
        if (parserForm.getLengthSync && parserForm.getLengthSync() > 0) {
          const parserResponse = await axios.post(process.env.RESUME_PARSER_URL, parserForm, {
            headers: parserForm.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          });
          parsedResumeData = parserResponse?.data?.data || null;

          // Fit scoring
          if (parsedResumeData?.skills && Array.isArray(parsedResumeData.skills) && parsedResumeData.skills.length > 0) {
            const resumeSkills = parsedResumeData.skills.map((s) => s.toLowerCase());
            const jobText = `${jobDetails.title} ${jobDetails.description} ${jobDetails.category}`.toLowerCase();
            const matchedSkills = resumeSkills.filter((skill) => jobText.includes(skill));
            fitScore = (matchedSkills.length / resumeSkills.length) * 100;
            fitScore = Number(fitScore.toFixed(2));
          }
        }
      } catch (parseErr) {
        console.error("Resume Parser Error:", parseErr?.message || parseErr);
        // continue without blocking — parsedResumeData remains null
      }
    } 
    // ---------- HANDLE PROFILE RESUME (no uploaded file) ----------
    else if (hasProfileResume) {
      // use resume saved on user's profile
      cloudinaryResponse = {
        public_id: req.user.resume?.public_id || null,
        secure_url: req.user.resume?.url || null,
      };
      parsedResumeData = req.user.resume?.parsed || null;

      // If parsed resume exists, calculate fitScore
      try {
        if (parsedResumeData?.skills && Array.isArray(parsedResumeData.skills) && parsedResumeData.skills.length > 0) {
          const resumeSkills = parsedResumeData.skills.map((s) => s.toLowerCase());
          const jobText = `${jobDetails.title} ${jobDetails.description} ${jobDetails.category}`.toLowerCase();
          const matchedSkills = resumeSkills.filter((skill) => jobText.includes(skill));
          fitScore = (matchedSkills.length / resumeSkills.length) * 100;
          fitScore = Number(fitScore.toFixed(2));
        }
      } catch (err) {
        console.error("Fit score error for profile resume:", err);
      }
    }

    // Create application in DB (preserve original structure)
    const application = await Application.create({
      name,
      email,
      coverLetter,
      phone,
      address,
      applicantID,
      employerID,
      jobId,
      resume: {
        public_id: cloudinaryResponse?.public_id || "local-file",
        url: cloudinaryResponse?.secure_url || cloudinaryResponse?.url || "",
        parsed: parsedResumeData || null,
      },
      fitScore,
    });

    res.status(200).json({
      success: true,
      message: "Application Submitted!",
      application,
    });
  } catch (error) {
    if (error.message?.includes("api_key")) {
      return next(new ErrorHandler("File upload service configuration error", 500));
    }
    return next(error);
  }
});

export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }
  const { _id } = req.user;
  const applications = await Application.find({ "employerID.user": _id }).populate("jobId", "title description");
  res.status(200).json({
    success: true,
    applications,
  });
});

export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  const { _id } = req.user;
  const applications = await Application.find({ "applicantID.user": _id }).populate("jobId", "title description");
  res.status(200).json({
    success: true,
    applications,
  });
});

export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }
  if (application?.applicantID?.user?.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this application.", 403));
  }
  await application.deleteOne();
  res.status(200).json({
    success: true,
    message: "Application Deleted!",
  });
});

// ✅ Update application status (employer only)
export const updateApplicationStatus = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  const { id } = req.params;
  const { status } = req.body;

  console.log("➡️ Update request received for:", id);
  console.log("➡️ Status to update:", status);
  console.log("➡️ Role:", role);

  if (role !== "Employer") {
    return next(new ErrorHandler("Only Employer can update application status.", 403));
  }

  const application = await Application.findById(id);
  if (!application) {
    console.log("❌ Application not found with ID:", id);
    return next(new ErrorHandler("Application not found", 404));
  }
  if (application?.employerID?.user?.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this application.", 403));
  }

  application.status = status;
  await application.save();

  res.status(200).json({
    success: true,
    message: `Application status updated to ${status}`,
  });
});
