# 💼 Job Portal – Full Stack Application

A modern **Job Portal web application** that connects **job seekers** and **employers**, built using the **MERN stack** and enhanced with a **resume parsing & job-matching system** powered by **FastAPI**.

This project started from a basic structure and has been **significantly extended and customized** with new features, improved backend logic, and resume-based job matching.

---

## 🚀 Features

### 👤 Job Seeker
- User registration & login (JWT authentication)
- Browse and search job listings
- Upload resume (PDF/DOCX)
- Resume-based job recommendations
- View detailed job descriptions

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

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication

### Resume Parser
- FastAPI (Python)
- PyMuPDF
- OCR (Tesseract)
- Basic NLP for skill extraction

---

## 📁 Project Structure
Job-Poral/
│
├── frontend/ # React frontend
├── backend/ # Node.js + Express backend
├── resume-parser/ # FastAPI resume parsing service
├── README.md
└── .gitignore


---

## 🧠 How It Works

1. User registers or logs in
2. Employer posts jobs with required skills
3. Job seeker uploads resume
4. Resume parser extracts skills
5. Backend matches resume skills with job skills
6. Relevant jobs are shown to the user

This makes the portal smarter than a traditional job board.

---

