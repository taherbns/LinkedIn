import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'a_secret_key')
    SQLALCHEMY_DATABASE_URI = (
        f"{os.getenv('DB_CONNECTION', 'mysql+pymysql')}://"
        f"{os.getenv('DB_USERNAME', 'root')}:"
        f"{os.getenv('DB_PASSWORD', '')}@"
        f"{os.getenv('DB_HOST', 'localhost')}:"
        f"{os.getenv('DB_PORT', '3306')}/"
        f"{os.getenv('DB_DATABASE', 'recruitment_platform')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
