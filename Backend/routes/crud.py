import pandas as pd
from flask import Blueprint, request, jsonify
from flask_cors import CORS  # Importer flask-cors
import os
from models import db, Job, Recruiter  # Importer db et Job depuis le modèle
from flask_jwt_extended import jwt_required, get_jwt_identity

crud = Blueprint('crud', __name__)

# Chemin du fichier CSV
CSV_FILE_PATH = "jobs.csv"

# Fonction pour charger ou créer le fichier CSV
def load_jobs_csv():
    if not os.path.exists(CSV_FILE_PATH):
        df = pd.DataFrame(columns=["id", "title", "description", "skills", "location", "type"])
        df.to_csv(CSV_FILE_PATH, index=False)
    return pd.read_csv(CSV_FILE_PATH)

def save_jobs_csv(jobs_df):
    jobs_df.to_csv(CSV_FILE_PATH, index=False)

# Charger ou créer le CSV
jobs_csv = load_jobs_csv()

@crud.route('/api/candidate/jobs', methods=['GET'])
@jwt_required()  # Keep this if you want the route to be secured
def get_all_jobs():
    try:
        # Retrieve all jobs from the database
        all_jobs = Job.query.all()

        # Format the jobs as a list of dictionaries
        jobs_list = [
            {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'skills': job.skills,
                'location': job.location,
                'type': job.type
            }
            for job in all_jobs
        ]

        return jsonify(jobs_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@crud.route('/jobs', methods=['GET'])
@jwt_required()
def get_recruiter_jobs():
    try:
        # Extract the current recruiter's email from the token
        current_user_email = get_jwt_identity()

        # Find the recruiter associated with this email
        recruiter = Recruiter.query.filter_by(email=current_user_email).first()

        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404

        # Retrieve jobs associated with this recruiter
        recruiter_jobs = Job.query.filter_by(recruiter_id=recruiter.id).all()

        # Format the jobs as a list of dictionaries
        jobs_list = [
            {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'skills': job.skills,
                'location': job.location,
                'type': job.type
            }
            for job in recruiter_jobs
        ]

        return jsonify(jobs_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@crud.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    data = request.json
    print("Requête reçue :", data)
    try:

        current_user_email = get_jwt_identity()

        # Find the recruiter associated with this email
        recruiter = Recruiter.query.filter_by(email=current_user_email).first()
        

        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404

        # Retrieve jobs associated with this recruiter
        recruiter_jobs = Job.query.filter_by(recruiter_id=recruiter.id).all()
        # Create a new job entry
        new_job = Job(
            title=data['title'],
            description=data['description'],
            skills=data['skills'],
            location=data['location'],
            type=data['type'],
            recruiter_id=recruiter.id
        )
        db.session.add(new_job)
        db.session.commit()

        # Update the CSV file
        global jobs_csv
        new_job_csv = {
            "id": new_job.id,
            "title": data['title'],
            "description": data['description'],
            "skills": data['skills'],
            "location": data['location'],
            "type": data['type'],
            "recruiter_id" : recruiter.id
        }
        jobs_csv = pd.concat([jobs_csv, pd.DataFrame([new_job_csv])], ignore_index=True)
        save_jobs_csv(jobs_csv)

        return jsonify({"id": new_job.id, "message": "Offre d'emploi créée avec succès"}), 201
    except Exception as e:
        print("Erreur :", str(e))
        return jsonify({"error": "Une erreur inattendue est survenue"}), 500


@crud.route('/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    data = request.json
    print("Requête reçue pour mise à jour :", data)
    try:
        # Update job in the database
        job = Job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job non trouvé"}), 404

        job.title = data['title']
        job.description = data['description']
        job.skills = data['skills']
        job.location = data['location']
        job.type = data['type']
        db.session.commit()

        return jsonify({"message": "Offre mise à jour avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@crud.route('/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    print("Requête reçue pour suppression ID :", job_id)
    try:
        # Delete job from the database
        job = Job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job non trouvé"}), 404

        db.session.delete(job)
        db.session.commit()

        return jsonify({"message": "Offre supprimée avec succès"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@crud.route('/job-details/<int:job_id>', methods=['GET'])
def get_job_details(job_id):
    try:
        global jobs_csv
        job_csv = jobs_csv[jobs_csv["id"] == job_id]
        if not job_csv.empty:
            job_dict = job_csv.iloc[0].to_dict()
            # Ensure no NaN values in the response
            job_dict = {k: v if pd.notna(v) else None for k, v in job_dict.items()}
            return jsonify(job_dict), 200

        job = Job.query.get(job_id)
        if not job:
            return jsonify({"error": "Job non trouvé"}), 404

        job_details = {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "skills": job.skills,
            "location": job.location,
            "type": job.type
        }
        return jsonify(job_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
