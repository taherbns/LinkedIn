from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from sqlalchemy import JSON

db = SQLAlchemy()
bcrypt = Bcrypt()

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)  # Main company email
    address = db.Column(db.String(255), nullable=True)
    recruiter = db.relationship('Recruiter', backref='company', uselist=False)  # One-to-one relationship

class Recruiter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    prenom = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(15), nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), unique=True, nullable=False)
    image_path = db.Column(db.String(200), nullable=True)
    face_encoding = db.Column(JSON)
    validated = db.Column(db.Boolean, default=False, nullable=False)

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(50), nullable=False)
    prenom = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(15), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    skills = db.Column(db.String(200), nullable=True)
    image_path = db.Column(db.String(200), nullable=True)
    face_encoding = db.Column(JSON) 
    about_me = db.Column(db.String(400), nullable=True)
    validated = db.Column(db.Boolean, default=False, nullable=False)  # New attribute

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    skills = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    type = db.Column(db.Enum('CDI', 'CDD', 'Stage'), nullable=False)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('recruiter.id'), nullable=False)
    applications = db.relationship(
        'JobApplication',
        backref='job',
        cascade='all, delete-orphan',
        passive_deletes=True  
    )


class JobApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id', ondelete='CASCADE'), nullable=False)
    cv_filename = db.Column(db.String(255), nullable=False)
    cover_letter_filename = db.Column(db.String(255), nullable=False)
