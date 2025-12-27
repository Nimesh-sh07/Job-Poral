import express from "express";
import {
  deleteJob,
  getAllJobs,
  getMyJobs,
  getSingleJob,
  postJob,
  updateJob,
  matchJobsToResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/jobController.js";
import { matchResumeFromProfile } from "../controllers/resumeController.js"; // ✅ Added
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Public
router.get("/getall", getAllJobs);

// Protected
router.post("/post", isAuthenticated, postJob);
router.get("/getmyjobs", isAuthenticated, getMyJobs);
router.put("/update/:id", isAuthenticated, updateJob);
router.delete("/delete/:id", isAuthenticated, deleteJob);

// Saved Jobs
router.get("/saved", isAuthenticated, getSavedJobs);
router.post("/save/:id", isAuthenticated, saveJob);
router.delete("/unsave/:id", isAuthenticated, unsaveJob);

// Job Matching
router.post("/match-resume", isAuthenticated, matchJobsToResume);
router.post("/match-profile-resume", isAuthenticated, matchResumeFromProfile); // ✅ NEW route

// Get single job
router.get("/:id", isAuthenticated, getSingleJob);

export default router;
