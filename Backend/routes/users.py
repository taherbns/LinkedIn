from flask import Blueprint, jsonify, request
from models import db, Recruiter, Candidate
from flask_cors import cross_origin  # If CORS is used for specific endpoints
# Import your Recruiter model
from flask_jwt_extended import decode_token 
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
users = Blueprint('users', __name__)

# List all recruiters and their associated companies
@users.route('/api/recruiters', methods=['GET'])
@jwt_required()
def get_recruiters():
    recruiters = Recruiter.query.all()
    response = [
        {
            'id': recruiter.id,
            'nom': recruiter.nom,
            'prenom': recruiter.prenom,
            'email': recruiter.email,
            'company': {
                'id': recruiter.company.id,
                'name': recruiter.company.name,
                'email': recruiter.company.email
            } if recruiter.company else None,
            'image_path': recruiter.image_path, # Include image_path
            'face_encoding' : recruiter.face_encoding   # Include face_encoding
        } for recruiter in recruiters
    ]
    return jsonify(response), 200

# List all candidates
@users.route('/api/candidate/profile', methods=['GET'])
@jwt_required()
def get_candidate_profile():
    try:
        current_user_email = get_jwt_identity()  # Extract the email from the token
        candidate = Candidate.query.filter_by(email=current_user_email).first()

        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404

        return jsonify({
            'id': candidate.id,
            'nom': candidate.nom,
            'prenom': candidate.prenom,
            'email': candidate.email,
            'phone': candidate.phone,
            'address': candidate.address,
            'skills': candidate.skills,
            'avatar': candidate.image_path,
            'aboutMe': candidate.about_me
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@users.route('/api/recruiter/profile', methods=['GET'])
@jwt_required()
def get_recruiter_profile():
    try:
        current_user_email = get_jwt_identity()  # Extract the email from the token
        recruiter = Recruiter.query.filter_by(email=current_user_email).first()

        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404

        return jsonify({
            'nom': recruiter.nom,
            'prenom': recruiter.prenom,
            'email': recruiter.email,
            'phone': recruiter.phone,
            'company': {'address': recruiter.company.address} if recruiter.company else None,
            'avatar': recruiter.image_path
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@users.route('/api/recruiter/profile', methods=['PUT'])
@jwt_required()
def update_recruiter_profile():
    data = request.json  # Get the JSON payload from the request
    
    try:
        # Extract email from the JWT token
        user_email = get_jwt_identity()
        recruiter = Recruiter.query.filter_by(email=user_email).first()

        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404

        # Update fields dynamically
        if data.get('phone'):
            recruiter.phone = data['phone']
        if data.get('address') and recruiter.company:
            recruiter.company.address = data['address']

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@users.route('/api/candidate/profile', methods=['PUT'])
@jwt_required()
def update_candidate_profile():
    data = request.json  # Get the JSON payload from the request
    print(data)
    try:
        # Extract email from the JWT token
        user_email = get_jwt_identity()
        candidate = Candidate.query.filter_by(email=user_email).first()

        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404

        # Update fields dynamically
        if data.get('phone'):
            candidate.phone = data['phone']
        if data.get('skills'):
            candidate.skills = data['skills']
        if data.get('aboutMe'):
            candidate.about_me = data['aboutMe']
        if data.get('address'):
            candidate.address = data['address']    
 
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@users.route('/api/recruiter/avatar', methods=['POST'])
@jwt_required()
def upload_recruiter_avatar():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    file = request.files.get('avatar')
    if not file:
        return jsonify({'message': 'No file uploaded'}), 400

    try:
        current_user_email = get_jwt_identity()  # Extract the email from the token
        recruiter = Recruiter.query.filter_by(email=current_user_email).first()

        if not recruiter:
            return jsonify({'message': 'Recruiter not found'}), 404

        # Save file
        filename = f"{recruiter.nom}_{recruiter.prenom}.png"
        filepath = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)

        recruiter.image_path = filepath
        db.session.commit()

        return jsonify({'message': 'Avatar updated successfully', 'avatar': filepath}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

@users.route('/api/candidate/avatar', methods=['POST'])
@jwt_required()
def upload_candidate_avatar():
    file = request.files.get('avatar')
    if not file:
        return jsonify({'message': 'No file uploaded'}), 400

    try:
        current_user_email = get_jwt_identity()  # Extract the email from the token
        candidate = Candidate.query.filter_by(email=current_user_email).first()

        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404

        # Save file
        filename = f"{candidate.nom}_{candidate.prenom}.png"
        filepath = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(filepath)

        candidate.image_path = filepath
        db.session.commit()

        return jsonify({'message': 'Avatar updated successfully', 'avatar': filepath}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

@users.route('/api/candidate/skills', methods=['PUT'])
@jwt_required()
def update_candidate_skills():
    try:
        # Extract current user's email from JWT token
        current_user_email = get_jwt_identity()
        candidate = Candidate.query.filter_by(email=current_user_email).first()

        if not candidate:
            return jsonify({'message': 'Candidate not found'}), 404

        # Get new skills from request
        data = request.json
        new_skills = data.get('skills')
        if not new_skills:
            return jsonify({'message': 'No skills provided'}), 400

        # Update candidate's skills
        candidate.skills = new_skills
        db.session.commit()

        return jsonify({'message': 'Skills updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Endpoint pour récupérer tous les candidats
@users.route("/candidates", methods=["GET"])
def get_candidates():
    """Récupère tous les candidats."""
    try:
        # Récupérer tous les candidats depuis la base de données
        candidates = Candidate.query.all()
        # Sérialiser les résultats
        candidates_list = [{
            "id": candidate.id,
            "nom": candidate.nom,
            "prenom": candidate.prenom,
            "email": candidate.email,
            "skills": candidate.skills
        } for candidate in candidates]

        return jsonify(candidates_list), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Endpoint pour rechercher des candidats par compétence
@users.route("/search-candidates", methods=["GET"])
def search_candidates():
    """Recherche des candidats par compétence."""
    try:
        skill = request.args.get("skill")
        if not skill:
            return jsonify({"error": "La compétence est requise"}), 400

        # Rechercher les candidats avec une compétence spécifique (case insensitive)
        candidates = Candidate.query.filter(
            Candidate.skills.ilike(f"%{skill.lower()}%")
        ).all()

        # Sérialiser les résultats
        candidates_list = [{
            "id": candidate.id,
            "nom": candidate.nom,
            "prenom": candidate.prenom,
            "email": candidate.email,
            "skills": candidate.skills
        } for candidate in candidates]

        return jsonify(candidates_list), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500