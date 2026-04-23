# Ai Job Portal App with MERN Stack

A modern **Job Portal web application** that connects **job seekers** and **employers**, built using the **MERN stack** and enhanced with a **resume parsing & job-matching system** powered by **FastAPI**.

This project started from a basic structure and has been **significantly extended and customized** with new features, improved backend logic, and resume-based job matching.

---

## 🚀 Features

- **Frontend:** React.js, React Router, Vite
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT (JSON Web Tokens), Bcrypt (for password hash)
- **File Upload:** Cloudinary (for profile images) + local storage support (for resumes)
- **Resume Parsing Service:** FastAPI, spaCy, PyMuPDF, pytesseract
- **Deployment:** Vercel (frontend), Render(backend), MongoDB Atlas (database)

### 🏢 Employer
- Employer registration & login
- Post new job openings
- View and manage posted jobs
- Define required skills for jobs

### 📄 Resume Parser & Matching
- FastAPI-based resume parsing service
- Extracts skills from resumes
- Matches resume skills with job required skills
- Jobs are ranked based on skill relevance

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- CSS / Tailwind-style utility classes
- Axios


2. Install NPM packages:

   ```sh
   cd react-job-portal
   cd backend
   npm install
   cd ..
   cd frontend
   npm install
   ```

3. Install resume parser dependencies (Python):

   ```sh
   cd ../resume-parser
   pip install -r requirements.txt
   ```


## 📁 Project Structure
Job-Poral/
│
├── frontend/ # React frontend
├── backend/ # Node.js + Express backend
├── resume-parser/ # FastAPI resume parsing service
├── README.md
└── .gitignore


   ```env
   PORT=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_CLOUD_NAME=
   FRONTEND_URL=
   DB_URL=
   JWT_SECRET_KEY=
   JWT_EXPIRE=
   COOKIE_EXPIRE=
   RESUME_PARSER_URL=
   ```

## 🧠 How It Works

1. User registers or logs in
2. Employer posts jobs with required skills
3. Job seeker uploads resume
4. Resume parser extracts skills
5. Backend matches resume skills with job skills
6. Relevant jobs are shown to the user

This makes the portal smarter than a traditional job board.

6. Run the application frontend (make sure you are in `/frontend` directory) :
   ```sh
   npm run dev
   ```
7. Run the resume parser service (make sure you are in `/resume-parser` directory):

   ```sh
   uvicorn main:app --reload --port 8000
   ```

8. Open your browser and navigate to `http://localhost:5173` to view the app.


