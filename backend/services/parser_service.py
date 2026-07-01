import fitz
from docx import Document
import os

def extract_pdf_text(file_path: str):
    with fitz.open(file_path) as doc:
        return "\n".join([page.get_text() for page in doc])

def extract_docx_text(file_path: str):
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_resume_text(file_path: str, ext: str):
    if ext.lower() == ".pdf":
        return extract_pdf_text(file_path)
    elif ext.lower() == ".docx":
        return extract_docx_text(file_path)
    return ""