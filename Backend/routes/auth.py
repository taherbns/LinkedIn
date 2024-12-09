import os
import cv2
import numpy as np
import face_recognition
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import db, Candidate, Recruiter, Company, bcrypt
from flask_jwt_extended import create_access_token

auth = Blueprint('auth', __name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_face_encoding(image_path):
    """Extract face encoding from an image."""
    image = cv2.imread(image_path)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image)
    if not face_locations:
        return None
    face_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]
    return face_encoding.tolist()


from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import db, Recruiter, Company, bcrypt
import os
import cv2
import numpy as np
import face_recognition

auth = Blueprint('auth', __name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'image/png', 'image/jpg', 'image/jpeg'}

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_face_encoding(image_path):
    """Extract face encoding from an image."""
    try:
        image = cv2.imread(image_path)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_image)
        if not face_locations:
            return None
        face_encoding = face_recognition.face_encodings(rgb_image, face_locations)[0]
        return face_encoding.tolist()  # Convert to a list to store as JSON
    except Exception as e:
        print(f"Error extracting face encoding: {e}")
        return None

@auth.route('/api/company_with_recruiter/register', methods=['POST'])
def register_company_with_recruiter():
    data = request.form
    file = request.files.get('image')

    # Extract form data
    company_name = data.get('company_name')
    company_email = data.get('company_email')
    company_address = data.get('company_address')
    recruiter_nom = data.get('recruiter_nom')
    recruiter_prenom = data.get('recruiter_prenom')
    recruiter_email = data.get('recruiter_email')
    recruiter_password = data.get('recruiter_password')

    # Validate input
    if not all([company_name, company_address, company_email, recruiter_nom, recruiter_prenom, recruiter_email, recruiter_password]):
        return jsonify({'message': 'Missing required fields'}), 400
     
    if not file or file.mimetype not in ['image/png', 'image/jpeg', 'image/jpg']:
        return jsonify({'message': 'Invalid or missing image file'}), 400

    # Save the image
    
    filename = f"{recruiter_nom}_{recruiter_prenom}.png".replace(" ", "_")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(filepath)

    # Extract face encoding
    face_encoding = extract_face_encoding(filepath)
    if not face_encoding:
        return jsonify({'message': 'No face detected in the uploaded image'}), 400

    # Check if email already exists
    if Recruiter.query.filter_by(email=recruiter_email).first():
        return jsonify({'message': 'Recruiter email already registered'}), 400
    if Company.query.filter_by(email=company_email).first():
        return jsonify({'message': 'Company email already registered'}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(recruiter_password).decode('utf-8')

    # Create and save the company
    new_company = Company(name=company_name, email=company_email , address=company_address)
    db.session.add(new_company)
    db.session.flush()  # Generate company ID for the foreign key

    # Create and save the recruiter
    new_recruiter = Recruiter(
        nom=recruiter_nom,
        prenom=recruiter_prenom,
        email=recruiter_email,
        password=hashed_password,
        company_id=new_company.id,
        image_path=filepath,
        face_encoding=face_encoding  # Save encoding
    )
    db.session.add(new_recruiter)
    db.session.commit()

    return jsonify({'message': 'Company and recruiter registered successfully'}), 201


@auth.route('/api/candidate/register', methods=['POST'])
def register_candidate():
    data = request.form
    file = request.files.get('image')

    nom = data.get('nom')
    prenom = data.get('prenom')
    email = data.get('email')
    password = data.get('password')

    # Debugging: Print incoming data
    print(f"Form Data: {data}")
    print(f"File Received: {file.filename if file else 'No file received'}")
    print(f"MIME Type: {file.mimetype if file else 'No file'}")

    # Validation
    if not all([nom, prenom, email, password]):
        return jsonify({'message': 'Missing required fields'}), 400

    if not file or file.mimetype not in ['image/png', 'image/jpeg', 'image/jpg']:
        return jsonify({'message': 'Invalid or missing image file'}), 400

    if Candidate.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400

    # Save the image with a custom filename
    filename = f"{nom}_{prenom}.png".replace(" ", "_")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(filepath)
    print(f"File saved at: {filepath}")

    # Extract face encoding
    face_encoding = extract_face_encoding(filepath)
    if not face_encoding:
        return jsonify({'message': 'No face detected in the uploaded image'}), 400

    # Hash password and save candidate
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_candidate = Candidate(
        nom=nom,
        prenom=prenom,
        email=email,
        password=hashed_password,
        image_path=filepath,
        face_encoding=face_encoding  # Save encoding
    )
    db.session.add(new_candidate)
    db.session.commit()

    return jsonify({'message': 'Candidate registered successfully'}), 201
@auth.route('/api/auth/login_with_face', methods=['POST'])
def login_with_face():
    file = request.files.get('image')

    # Validate the file input
    if not file or file.mimetype not in ['image/png', 'image/jpeg', 'image/jpg']:
        return jsonify({'message': 'Invalid or missing image file'}), 400

    # Save the uploaded image temporarily
    try:
        filepath = os.path.join('uploads/temp', secure_filename(file.filename))
        os.makedirs('uploads/temp', exist_ok=True)
        file.save(filepath)
    except Exception as e:
        return jsonify({'message': f"Failed to save image file: {str(e)}"}), 500

    # Extract face encoding from the uploaded image
    try:
        face_encoding = extract_face_encoding(filepath)
        if not face_encoding:
            return jsonify({'message': 'No face detected in the uploaded image'}), 400
    except Exception as e:
        return jsonify({'message': f"Error processing the image: {str(e)}"}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(filepath):
            os.remove(filepath)

    # Retrieve all stored users (candidates and recruiters)
    try:
        candidates = Candidate.query.all()
        recruiters = Recruiter.query.all()
        users = candidates + recruiters  # Combine both lists
    except Exception as e:
        return jsonify({'message': f"Database query failed: {str(e)}"}), 500

    # Compare face encoding with stored encodings
    try:
        for user in users:
            if user.face_encoding:  # Ensure the user has a valid face encoding
                # Convert stored encoding (list) and extracted encoding (array) to NumPy arrays
                stored_encoding = np.array(user.face_encoding)
                face_encoding = np.array(face_encoding)

                if face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=0.6)[0]:
                    role = 'candidate' if isinstance(user, Candidate) else 'recruiter'
                    return jsonify({
                        'message': 'Face recognized',
                        'user': {
                            'role': role,
                            'id': user.id,
                            'name': f"{user.nom} {user.prenom}",
                            'email': user.email
                        }
                    }), 200
    except Exception as e:
        return jsonify({'message': f"Error during face comparison: {str(e)}"}), 500

    return jsonify({'message': 'Face not recognized'}), 404

@auth.route('/api/auth/login_with_face_and_credentials', methods=['POST'])
def login_with_face_and_credentials():
    data = request.form

    file = request.files.get('image')

    email = data.get('email')
    password = data.get('password')

    # Validate input
    if not email or not password or not file:
        return jsonify({'message': 'Missing required fields'}), 400

    if file.mimetype not in ['image/png', 'image/jpeg', 'image/jpg']:
        return jsonify({'message': 'Invalid or missing image file'}), 400

    # Save the uploaded image temporarily
    filepath = os.path.join('uploads/temp', secure_filename(file.filename))
    os.makedirs('uploads/temp', exist_ok=True)
    file.save(filepath)

    try:
        # Extract face encoding
        face_encoding = extract_face_encoding(filepath)
        if not face_encoding:
            return jsonify({'message': 'No face detected in the uploaded image'}), 400

        # Ensure extracted encoding is a NumPy array
        face_encoding = np.array(face_encoding)
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

    # Authenticate credentials
    user = Candidate.query.filter_by(email=email).first() or Recruiter.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    # Ensure stored face encoding is a NumPy array
    stored_encoding = np.array(user.face_encoding)

    # Compare face encoding
    if not face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=0.6)[0]:
        return jsonify({'message': 'Face recognition failed'}), 401
    
    if not user.validated:
        return jsonify({'message': 'Account not validated. Please contact the administrator.'}), 403

    # Generate a token (optional)
      # Generate a JWT token
    token = create_access_token(identity=user.email)

    role = 'candidate' if isinstance(user, Candidate) else 'recruiter'
    return jsonify({
        'message': 'Authentication successful',
        'token': token,
        'user': {
            'role': role,
            'id': user.id,
            'name': f"{user.nom} {user.prenom}",
            'email': user.email
        }
    }), 200


