from flask import Blueprint, request, jsonify, abort
from langchain_openai.embeddings import OpenAIEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
from dotenv import load_dotenv
import os
from models import db, JobApplication
from PyPDF2 import PdfReader
from docx import Document
import chardet  # For encoding detection
from sqlalchemy.sql import text  # Import text for SQL execution

# Define the blueprint
matchingApplications = Blueprint('matchingApplications', __name__)

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("La clé API OpenAI est manquante. Assurez-vous qu'elle est définie dans le fichier .env ou les variables d'environnement.")

# Initialize OpenAI embeddings
try:
    embeddings = OpenAIEmbeddings(openai_api_key=api_key)
except Exception as e:
    raise ValueError(f"Erreur lors de l'initialisation des embeddings OpenAI : {e}")

def serve_uploaded_file(filename):
    sanitized_filename = os.path.normpath(filename).lstrip("Uploads\\")
    full_path = os.path.join("uploads/", sanitized_filename)

    if not os.path.exists(full_path):
        abort(404, description=f"File not found: {full_path}")
    return full_path

def detect_encoding(file_path):
    """
    Detect the encoding of a given file using the chardet library.
    """
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read())
        return result['encoding']

def load_jobs():
    try:
        # Detect file encoding
        encoding = detect_encoding("jobs.csv")
        jobs = pd.read_csv("jobs.csv", encoding=encoding)
        if jobs.empty:
            abort(400, description="Le fichier jobs.csv est vide.")
        return jobs
    except FileNotFoundError:
        abort(404, description="Le fichier jobs.csv est introuvable.")
    except UnicodeDecodeError as e:
        abort(500, description=f"Erreur d'encodage : {str(e)}")
    except Exception as e:
        abort(500, description=f"Erreur lors du chargement des offres d'emploi : {e}")

def generate_job_embeddings(jobs):
    try:
        jobs['embedding'] = jobs['description'].apply(
            lambda desc: embeddings.embed_query(desc)
        )
        return jobs
    except Exception as e:
        abort(500, description=f"Erreur lors de la génération des embeddings : {e}")

def extract_text_from_file(file_path):
    try:
        if not os.path.exists(file_path):
            abort(404, description=f"Fichier introuvable : {file_path}")
        if file_path.endswith(".pdf"):
            reader = PdfReader(file_path)
            text = "".join([page.extract_text() for page in reader.pages])
            return text
        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            text = " ".join(paragraph.text for paragraph in doc.paragraphs)
            return text
        else:
            abort(400, description=f"Format de fichier non pris en charge : {file_path}")
    except Exception as e:
        abort(500, description=f"Erreur lors de la lecture du fichier {file_path} : {e}")

from sqlalchemy.sql import text  # Import SQL text functionality

@matchingApplications.route("/calculate-similarity/<int:job_id>", methods=["POST"])
def calculate_similarity_for_job(job_id):
    try:
        # Load job data
        jobs = load_jobs()
        job = jobs[jobs["id"] == job_id]
        if job.empty:
            abort(404, description="Job non trouvé.")

        job_skills = job.iloc[0]["skills"]
        job_description = job.iloc[0]["description"]

        # Database query for job applications
        connection = db.engine.connect()
        try:
            query = text("""
                SELECT candidate_id, cv_filename, cover_letter_filename 
                FROM job_application 
                WHERE job_id = :job_id
            """)
            result = connection.execute(query, {"job_id": job_id})
            
            # Convert rows to dictionaries using mappings
            candidates = [row for row in result.mappings()]
        finally:
            connection.close()

        if not candidates:
            return jsonify({"message": "Aucune candidature pour ce job."})

        # Process candidates
        results = []
        for candidate in candidates:
            try:
                cv_path = serve_uploaded_file(candidate["cv_filename"])
                cover_letter_path = serve_uploaded_file(candidate["cover_letter_filename"])

                cv_content = extract_text_from_file(cv_path)
                letter_content = extract_text_from_file(cover_letter_path)

                # Generate embeddings
                job_embedding = np.array(embeddings.embed_query(f"{job_skills} {job_description}"))
                cv_embedding = np.array(embeddings.embed_query(cv_content))
                letter_embedding = np.array(embeddings.embed_query(letter_content))

                # Calculate similarities
                cv_similarity = cosine_similarity([job_embedding], [cv_embedding])[0][0]
                letter_similarity = cosine_similarity([job_embedding], [letter_embedding])[0][0]
                overall_similarity = (cv_similarity + letter_similarity) / 2

                results.append({
                    "candidate_id": candidate["candidate_id"],
                    "cv_similarity": cv_similarity,
                    "letter_similarity": letter_similarity,
                    "overall_similarity": overall_similarity,
                    "cv_filename": cv_path,
                    "cover_letter_filename": cover_letter_path,
                })
            except Exception as e:
                results.append({
                    "candidate_id": candidate["candidate_id"],
                    "error": f"Erreur pour ce candidat : {e}"
                })

        # Sort results by similarity
        sorted_results = sorted(results, key=lambda x: x.get("overall_similarity", 0), reverse=True)
        return jsonify({"results": sorted_results})

    except Exception as e:
        abort(500, description=f"Erreur lors du calcul des similarités : {str(e)}")
