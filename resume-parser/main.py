from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import fitz  # PyMuPDF
import pytesseract
from PIL import Image, UnidentifiedImageError
import tempfile
import os
import spacy

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expanded skill keyword list
keyword_list = [
    "python", "react", "node", "express", "django", "mongodb", "sql", "ai", "ml", "nlp",
    "html", "css", "javascript", "design", "photoshop", "illustrator",
    "machine learning", "deep learning", "data science", "project management",
    "financial analysis", "excel", "salesforce", "java", "c++", "aws", "docker", "kubernetes",
    "flutter", "android", "ios", "cloud computing", "power bi", "tableau", "linux", "agile",
    "scrum", "nosql", "typescript", "bootstrap", "communication", "leadership"
]

# Skill extractor with NLP + keyword matcher
def extract_skills(text):
    text_lower = text.lower()
    matched_keywords = [kw for kw in keyword_list if kw in text_lower]

    # Use spaCy for noun phrases and tokens resembling skills
    doc = nlp(text_lower)
    noun_chunks = set(chunk.text.strip() for chunk in doc.noun_chunks if 2 <= len(chunk.text.strip()) <= 50)
    additional_skills = set()

    for token in doc:
        if token.pos_ in {"NOUN", "PROPN"} and len(token.text.strip()) > 2:
            additional_skills.add(token.text.strip())

    # Combine and deduplicate
    all_skills = set(matched_keywords + list(noun_chunks) + list(additional_skills))
    return sorted(list(all_skills))

# OCR & Text Extraction logic
def extract_text_and_skills(file_path, suffix):
    text = ""
    try:
        if suffix.lower() in [".jpg", ".jpeg", ".png", ".webp"]:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
        elif suffix.lower() == ".pdf":
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
        else:
            raise ValueError("Unsupported file type")
    except UnidentifiedImageError:
        raise ValueError("Could not read image content")
    except Exception as e:
        raise ValueError(f"Parsing error: {str(e)}")

    skills = extract_skills(text)
    return {
        "text": text[:500],  # Just a preview
        "skills": skills
    }

# Upload endpoint
@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[1]

        if not suffix:
            return {"success": False, "error": "File has no extension"}

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            if not contents:
                raise ValueError("Empty file upload detected.")
            tmp.write(contents)
            tmp_path = tmp.name

        result = extract_text_and_skills(tmp_path, suffix)
        os.remove(tmp_path)
        print("📤 Received file:", file.filename)
        print("📄 Extracted skills:", result["skills"])

        return {"success": True, "data": result}

    except Exception as e:
        print("❌ Resume parsing failed:", str(e))
        return {"success": False, "error": str(e)}

# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
