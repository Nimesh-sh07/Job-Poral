import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dbConnection from "./database/dbConnection.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import { config } from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { isAuthenticated } from "./middlewares/auth.js";

const app = express();
config({ path: "./config/config.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS Configuration
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Protect uploaded files so resumes are not publicly accessible without auth.
app.use("/uploads", isAuthenticated, express.static(path.join(__dirname, "uploads")));

// ✅ Enable file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ✅ API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/resume", resumeRouter);

// ✅ DB Connection
dbConnection();

// ✅ Error Middleware
app.use(errorMiddleware);

export default app;
