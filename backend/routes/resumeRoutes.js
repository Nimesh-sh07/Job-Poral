import express from "express";
import { matchResumeFromProfile } from "../controllers/resumeController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/match-profile-resume", isAuthenticated, matchResumeFromProfile);

export default router;
