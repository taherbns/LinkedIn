from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, bcrypt
from routes.auth import auth
from routes.users import users
from routes.cv_processor import cv_processor
from routes.chatbot_letter import chatbot_letter
from routes.crud import crud
from routes.matchingJobs import matchingJobs
from routes.apply import apply
from routes.matchingApplications import matchingApplications
from routes.chatbotdynamique import chatbotdynamique
from routes.chatbotRecruiter import chatbotRecruiter
from routes.sendMail import sendMail
from flask_jwt_extended import JWTManager 
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
app.config['JWT_SECRET_KEY'] = '@@@@@@@@' 
jwt = JWTManager(app)

db.init_app(app)
bcrypt.init_app(app)

migrate = Migrate(app, db)
app.register_blueprint(auth)
app.register_blueprint(users)
app.register_blueprint(cv_processor)
app.register_blueprint(chatbot_letter)
app.register_blueprint(sendMail)
app.register_blueprint(crud)
app.register_blueprint(matchingJobs)
app.register_blueprint(apply)
app.register_blueprint(chatbotRecruiter)
app.register_blueprint(matchingApplications)
app.register_blueprint(chatbotdynamique)
from flask import send_from_directory

@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory('uploads', filename.replace("\\", "/"))

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
