import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import stringSimilarity from "string-similarity";

// ✅ Get all jobs with search, filters, pagination, and sorting
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
  let {
    keyword = "",
    category,
    location,
    jobType,
    minSalary,
    maxSalary,
    page = 1,
    limit = 10,
    sortBy = "jobPostedOn",
    sortOrder = "desc",
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  const query = { expired: false };

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { city: { $regex: keyword, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (location) query.city = location;

  if (jobType === "fixed") query.fixedSalary = { $exists: true };
  else if (jobType === "ranged") query.salaryFrom = { $exists: true };

  if (minSalary || maxSalary) {
    const salaryFilters = [];

    const fixedSalaryFilter = {};
    if (minSalary) fixedSalaryFilter.$gte = Number(minSalary);
    if (maxSalary) fixedSalaryFilter.$lte = Number(maxSalary);
    if (Object.keys(fixedSalaryFilter).length > 0) {
      salaryFilters.push({ fixedSalary: fixedSalaryFilter });
    }

    const rangedFilter = {};
    if (minSalary) rangedFilter.salaryTo = { $gte: Number(minSalary) };
    if (maxSalary) rangedFilter.salaryFrom = { $lte: Number(maxSalary) };
    if (Object.keys(rangedFilter).length > 0) {
      salaryFilters.push(rangedFilter);
    }

    if (salaryFilters.length > 0) {
      query.$or = query.$or ? [...query.$or, ...salaryFilters] : salaryFilters;
    }
  }

  const skip = (page - 1) * limit;
  const allowedSortFields = ["jobPostedOn", "fixedSalary", "salaryFrom", "salaryTo"];
  if (!allowedSortFields.includes(sortBy)) sortBy = "jobPostedOn";
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const totalJobs = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate("postedBy", "name avatar");

  res.status(200).json({
    success: true,
    jobs,
    totalJobs,
    totalPages: Math.ceil(totalJobs / limit),
    currentPage: page,
  });
});

// ✅ Post a job
export const postJob = catchAsyncErrors(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const {
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    skillsRequired = [],
  } = req.body;

  if (!title || !description || !category || !country || !city || !location) {
    return next(new ErrorHandler("Please provide full job details.", 400));
  }

  if ((!salaryFrom || !salaryTo) && !fixedSalary) {
    return next(new ErrorHandler("Please either provide fixed salary or ranged salary.", 400));
  }

  if (salaryFrom && salaryTo && fixedSalary) {
    return next(new ErrorHandler("Cannot enter fixed and ranged salary together.", 400));
  }

  const job = await Job.create({
    title,
    description,
    category,
    country,
    city,
    location,
    fixedSalary,
    salaryFrom,
    salaryTo,
    skillsRequired,
    postedBy: req.user._id,
  });

  res.status(200).json({ success: true, message: "Job Posted Successfully!", job });
});

// ✅ Delete job
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this job.", 403));
  }

  await job.deleteOne();
  res.status(200).json({ success: true, message: "Job Deleted!" });
});

// ✅ Update job
export const updateJob = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this job.", 403));
  }

  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, message: "Job Updated!" });
});

// ✅ Get jobs posted by employer with filters
export const getMyJobs = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  let {
    search = "",
    status,
    fromDate,
    toDate,
    page = 1,
    limit = 10,
    sortBy = "jobPostedOn",
    sortOrder = "desc",
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  const query = { postedBy: req.user._id };

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (status === "active") query.expired = false;
  else if (status === "expired") query.expired = true;

  if (fromDate || toDate) {
    query.jobPostedOn = {};
    if (fromDate) query.jobPostedOn.$gte = new Date(fromDate);
    if (toDate) query.jobPostedOn.$lte = new Date(toDate);
  }

  const skip = (page - 1) * limit;
  const allowedSortFields = ["jobPostedOn", "fixedSalary", "salaryFrom", "salaryTo"];
  if (!allowedSortFields.includes(sortBy)) sortBy = "jobPostedOn";
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const totalJobs = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    jobs,
    totalJobs,
    totalPages: Math.ceil(totalJobs / limit),
    currentPage: page,
  });
});

// ✅ Get single job by ID
export const getSingleJob = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id).populate("postedBy", "name avatar");
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    return next(new ErrorHandler("Invalid ID / CastError", 404));
  }
});

// ✅ Save job
export const saveJob = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const jobId = req.params.id;

  if (!user.savedJobs.includes(jobId)) {
    user.savedJobs.push(jobId);
    await user.save();
  }

  res.status(200).json({ success: true, message: "Job saved successfully.", savedJobs: user.savedJobs });
});

// ✅ Unsave job
export const unsaveJob = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const jobId = req.params.id;

  user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
  await user.save();

  res.status(200).json({ success: true, message: "Job removed from saved list.", savedJobs: user.savedJobs });
});

// ✅ Get saved jobs
export const getSavedJobs = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("savedJobs");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ success: true, savedJobs: user.savedJobs });
});

// ✅ Resume Matching — now with fuzzy scoring via string-similarity
export const matchJobsToResume = catchAsyncErrors(async (req, res, next) => {
  const { parsedResume } = req.body;

  if (!parsedResume || !parsedResume.skills || parsedResume.skills.length === 0) {
    return next(new ErrorHandler("Resume data with skills is required.", 400));
  }

  const {
    minScore = 0,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "score",
    sortOrder = "desc",
  } = req.query;

  const resumeSkills = parsedResume.skills.map((s) => s.toLowerCase().trim());

  const allJobs = await Job.find({ expired: false }).populate("postedBy", "name");

  let matchedJobs = allJobs.map((job) => {
    const jobSkills = Array.isArray(job.skillsRequired)
      ? job.skillsRequired.map((s) => s.toLowerCase().trim())
      : [];

    let matchedCount = 0;
    let similaritySum = 0;

    for (const resumeSkill of resumeSkills) {
      const { bestMatch } = stringSimilarity.findBestMatch(resumeSkill, jobSkills);
      const matchRating = bestMatch.rating;

      // Consider it a valid match if rating > 0.5
      if (matchRating > 0.5) {
        matchedCount += 1;
        similaritySum += matchRating;
      }
    }

    const matchScore = matchedCount > 0
      ? ((matchedCount * (similaritySum / matchedCount)) / resumeSkills.length) * 100
      : 0;

    return {
      job,
      score: Number(matchScore.toFixed(2)),
      matchedCount,
    };
  });

  matchedJobs = matchedJobs.filter((j) => j.score >= Number(minScore));

   if (search) {
    const searchLower = search.toLowerCase();
    matchedJobs = matchedJobs.filter(
      ({ job }) =>
        job.title.toLowerCase().includes(searchLower) ||
        (job.postedBy?.name || "").toLowerCase().includes(searchLower)
    );
  }

 matchedJobs.sort((a, b) => {
    if (sortBy === "score") {
      return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
    } else if (sortBy === "matchedCount") {
      return sortOrder === "asc" ? a.matchedCount - b.matchedCount : b.matchedCount - a.matchedCount;
    }
    return 0;
  });

 const totalMatches = matchedJobs.length;
  const startIndex = (page - 1) * limit;
  const paginatedMatches = matchedJobs.slice(startIndex, startIndex + Number(limit));

  res.status(200).json({
    success: true,
    message: "Job matching completed",
    matches: paginatedMatches,
    totalMatches,
    totalPages: Math.ceil(totalMatches / limit),
    currentPage: Number(page),
  });
});