from flask import Blueprint, request, jsonify
import os
from models import db, Job, JobApplication, Recruiter
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
# Define blueprint
apply = Blueprint('apply', __name__)

# Folder to store uploaded files
UPLOAD_FOLDER = "Uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Route to handle job applications
@apply.route("/apply", methods=["POST"])
def apply_job():
    try:
        job_id = request.form.get("job_id", type=int)
        candidate_id = request.form.get("candidate_id", type=int)
        cv = request.files.get("cv")
        cover_letter = request.files.get("cover_letter")

        if not all([job_id, candidate_id, cv, cover_letter]):
            return jsonify({"error": "All fields are required"}), 400

        # Save uploaded files
        cv_filename = secure_filename(f"cv_{candidate_id}_{job_id}_{cv.filename}")
        cover_letter_filename = secure_filename(f"cover_letter_{candidate_id}_{job_id}_{cover_letter.filename}")
        cv_path = os.path.join(UPLOAD_FOLDER, cv_filename)
        cover_letter_path = os.path.join(UPLOAD_FOLDER, cover_letter_filename)

        cv.save(cv_path)
        cover_letter.save(cover_letter_path)

        # Insert application into the database
        new_application = JobApplication(
            candidate_id=candidate_id,
            job_id=job_id,
            cv_filename=cv_path,
            cover_letter_filename=cover_letter_path
        )
        db.session.add(new_application)
        db.session.commit()

        return jsonify({"message": "Application submitted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get all applications with job details
@apply.route("/applications", methods=["GET"])
def get_applications():
    try:
        applications = db.session.query(
            JobApplication.id.label("application_id"),
            JobApplication.candidate_id,
            JobApplication.job_id,
            JobApplication.cv_filename,
            JobApplication.cover_letter_filename,
            Job.title.label("job_title"),
            Job.description.label("job_description"),
            Job.skills.label("job_skills"),
            Job.location.label("job_location"),
            Job.type.label("job_type")
        ).join(Job, JobApplication.job_id == Job.id).all()

        # Serialize the data
        applications_list = [dict(app) for app in applications]
        return jsonify(applications_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




# Route to get application stats by job
@apply.route("/applications-stats", methods=["GET"])
@jwt_required()  # Ensure the user is authenticated
def get_applications_stats():
    try:
        # Extract the current recruiter's email from the token
        current_user_email = get_jwt_identity()

        # Find the recruiter associated with this email
        recruiter = Recruiter.query.filter_by(email=current_user_email).first()

        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404

        # Retrieve jobs associated with this recruiter
        recruiter_jobs = Job.query.filter_by(recruiter_id=recruiter.id).all()
        recruiter_job_ids = [job.id for job in recruiter_jobs]

        # Query the stats only for the recruiter's jobs
        stats = db.session.query(
            Job.id.label("job_id"),
            Job.title.label("job_title"),
            db.func.count(JobApplication.id).label("num_applications")
        ).outerjoin(JobApplication, Job.id == JobApplication.job_id)\
         .filter(Job.id.in_(recruiter_job_ids)).group_by(Job.id, Job.title).order_by(db.desc(db.func.count(JobApplication.id))).all()

        # Serialize the data
        stats_list = [{
            "job_id": stat.job_id,
            "job_title": stat.job_title,
            "num_applications": stat.num_applications
        } for stat in stats]

        return jsonify(stats_list), 200
    except Exception as e:
        # Return the exception message for debugging
        return jsonify({"error": str(e)}), 500

        

# Route to get candidates for a specific job
@apply.route("/candidates-by-job/<int:job_id>", methods=["GET"])
def get_candidates_by_job(job_id):
    try:
        candidates = JobApplication.query.filter_by(job_id=job_id).all()

        # Serialize the data
        candidates_list = [{
            "candidate_id": candidate.candidate_id,
            "cv_filename": candidate.cv_filename,
            "cover_letter_filename": candidate.cover_letter_filename
        } for candidate in candidates]

        return jsonify(candidates_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
