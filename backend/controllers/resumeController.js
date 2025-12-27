import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { Job } from "../models/jobSchema.js";

export const matchResumeFromProfile = async (req, res) => {
  try {
    const user = req.user;
    console.log("📥 Backend: match-profile-resume called by", user?.email);

    const resume = user?.resume;

    if (!resume || !resume.url) {
      console.warn("⚠️ No resume found in user profile.");
      return res.status(400).json({ message: "No resume found in profile." });
    }

    // ✅ Step 1: Extract just the filename from resume.url
    const filename = path.basename(resume.url);

    // ✅ Step 2: Construct absolute file path from backend root
    const localResumePath = path.resolve(process.cwd(), "uploads", "resumes", filename);

    console.log("🗂 Resume file path:", localResumePath);
    const fileExists = fs.existsSync(localResumePath);
    console.log("📁 Exists on disk:", fileExists);

    if (!fileExists) {
      console.error("❌ Resume file not found at:", localResumePath);
      return res.status(404).json({ message: "Resume file not found on server." });
    }

    // ✅ Step 3: Send file to FastAPI resume parser
    const form = new FormData();
    form.append("file", fs.createReadStream(localResumePath));

    const parserRes = await axios.post(process.env.RESUME_PARSER_URL, form, {
      headers: form.getHeaders(),
    });

    const skills = parserRes?.data?.data?.skills;
    console.log("🧠 Extracted skills from resume:", skills);

    if (!skills || skills.length === 0) {
      console.warn("⚠️ No skills found in parsed resume.");
      return res.status(200).json({ matches: [] });
    }

    // ✅ Step 4: Fetch all jobs and score by skill match
    const jobs = await Job.find();

    const matches = jobs.map((job) => {
      const jobSkills = job.skillsRequired?.map((s) => s.toLowerCase()) || [];
      const matched = jobSkills.filter((skill) => skills.includes(skill));
      const score = Math.round((matched.length / jobSkills.length) * 100) || 0;

      return { job, score };
    });

    const filteredMatches = matches.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);

    console.log(`✅ Found ${filteredMatches.length} matching jobs`);
    res.status(200).json({ matches: filteredMatches });
  } catch (error) {
    console.error("💥 matchResumeFromProfile error:", error);
    res.status(500).json({
      message: error.response?.data?.message || error.message || "Something went wrong",
    });
  }
};
