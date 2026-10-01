# Job Portal (MERN + FastAPI resume matching)

A job portal where **employers** post jobs with required skills and **job seekers** apply, bookmark jobs, and upload a resume. A separate **FastAPI service** extracts skills from the resume and the backend **ranks jobs by skill match**.


## Features
- JWT authentication (httpOnly cookie) with bcrypt password hashing and two roles: job seeker and employer
- Employers: post jobs, define required skills, manage listings, view applications
- Job seekers: browse jobs, apply, save jobs, upload a resume, see jobs ranked by match score
- Resume parsing service: PDF/image text extraction (PyMuPDF, Tesseract OCR) plus skill extraction (spaCy and a keyword list)

## Architecture
React (Vite) -> Express API -> MongoDB, with Cloudinary for images and a FastAPI service for resume skill extraction.

## Tech stack
- Frontend: React, React Router, Axios, Vite
- Backend: Node.js, Express, Mongoose, JWT, bcrypt
- Resume parser: Python, FastAPI, spaCy, PyMuPDF, pytesseract

## Run locally
1. Backend: `cd backend`, copy `.env.example` to `.env` and fill in your own values, then `npm install` and `npm run dev`
2. Resume parser (needs Python 3.10+ and the Tesseract binary): `cd resume-parser`, then `pip install -r requirements.txt`, `python -m spacy download en_core_web_sm`, `uvicorn main:app --reload --port 8000`
3. Frontend: `cd frontend`, then `npm install` and `npm run dev` (opens at http://localhost:5173)

## How matching works
1. The job seeker uploads a resume and the parser returns the extracted skills.
2. Each job's required skills are compared with them.
3. Score = matched skills / required skills (as a percentage), and jobs are sorted by score.

## Known limitations and roadmap
- Skill extraction is keyword and noun based, so it is approximate. Next step: a curated skills taxonomy.
- Add automated tests and rate limiting on the auth routes.

## Credits
Started from a basic job-portal template, then extended with resume matching, and backend logic.
