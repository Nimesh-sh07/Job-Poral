import express from "express";
import {
  login,
  register,
  logout,
  getUser,
  uploadResume,
  updateProfile,
  getPlatformStats, // ✅ added
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getuser", isAuthenticated, getUser);
router.post("/upload-resume", isAuthenticated, uploadResume);
router.put("/update", isAuthenticated, updateProfile);
router.get("/stats", getPlatformStats); // ✅ NEW route to get live stats

export default router;
