from app import db, app

with app.app_context():
    db.drop_all()  # Optional, ensures the database is clean
    db.create_all()  # Creates all tables defined in models.py
print("Database recreated successfully.")
