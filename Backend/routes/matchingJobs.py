from flask import Blueprint, request, jsonify
from langchain_openai.embeddings import OpenAIEmbeddings
from sklearn.metrics.pairwise import cosine_similarity
from flask_jwt_extended import decode_token 
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
from models import db, Job, JobApplication, Candidate

matchingJobs = Blueprint('matchingJobs', __name__)

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OpenAI API key is missing. Ensure it is set in the .env file or environment variables.")

# Load OpenAI embeddings
try:
    embeddings = OpenAIEmbeddings(openai_api_key=api_key)
except Exception as e:
    raise ValueError(f"Error initializing OpenAI embeddings: {e}")

# Generate embeddings for each job description
def generate_job_embeddings(jobs):
    try:
        for job in jobs:
            job.embedding = embeddings.embed_query(job.description)
        return jobs
    except Exception as e:
        return {"error": f"Error generating job embeddings: {str(e)}"}, 500

# Calculate similarities
def calculate_similarity(candidate_skills, jobs, top_n=3):
    try:
        candidate_embedding = np.array(embeddings.embed_query(candidate_skills)).reshape(1, -1)
        job_similarities = []

        for job in jobs:
            similarity = cosine_similarity(candidate_embedding, [np.array(job.embedding)])[0][0]
            job_similarities.append({
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "skills": job.skills,
                "location": job.location,
                "type": job.type,
                "similarity": similarity
            })

        # Sort by similarity and return top N results
        top_jobs = sorted(job_similarities, key=lambda x: x["similarity"], reverse=True)[:top_n]
        return top_jobs
    except Exception as e:
        return {"error": f"Error calculating similarities: {str(e)}"}, 500

# Endpoint for matching jobs
@matchingJobs.route("/match-jobs", methods=["POST"])
@jwt_required()
def match_jobs():
    try:
        # Extract current user's email from JWT token
        current_user_email = get_jwt_identity()
        candidate = Candidate.query.filter_by(email=current_user_email).first()

        if not candidate:
            return jsonify({"error": "Candidate not found."}), 404

        # Use the candidate's real skills
        candidate_skills = candidate.skills
        if not candidate_skills:
            return jsonify({"error": "Candidate does not have any skills listed."}), 400

        # Load jobs from the database
        jobs = Job.query.all()

        # Generate embeddings for jobs
        embeddings_result = generate_job_embeddings(jobs)
        if isinstance(embeddings_result, tuple):
            return jsonify(embeddings_result[0]), embeddings_result[1]

        # Calculate similarities and return top matches
        top_matches = calculate_similarity(candidate_skills, jobs)
        if isinstance(top_matches, tuple):
            return jsonify(top_matches[0]), top_matches[1]

        return jsonify({"top_jobs": top_matches}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
