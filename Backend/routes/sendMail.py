from flask import Blueprint, request, jsonify
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
 
# Initialiser l'application FastAPI

sendMail = Blueprint('sendMail', __name__)
# Modèle de requête pour l'envoi d'e-mail
class EmailRequest(BaseModel):
    recipient: EmailStr
    subject: str
    message: str
 
# Route pour envoyer un e-mail
@sendMail.route("/send-email", methods=["POST"])
def send_email():
    try:
        # Parse the JSON request
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request data"}), 400

        # Required parameters
        recipient = data.get("recipient")
        subject = data.get("subject")
        message = data.get("message")

        if not all([recipient, subject, message]):
            return jsonify({"error": "Recipient, subject, and message are required"}), 400

        # Email credentials
        sender_email = "taherpowerdata@gmail.com"  # Replace with your email address
        sender_password = "iytx iorr yqfd gnnd"  # Replace with your app password

        # Configure SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)

        # Create the email message
        msg = MIMEText(message)
        msg["Subject"] = subject
        msg["From"] = sender_email
        msg["To"] = recipient

        # Send the email
        server.sendmail(sender_email, recipient, msg.as_string())
        server.quit()

        return jsonify({"message": "E-mail envoyé avec succès."}), 200
    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'envoi de l'e-mail : {str(e)}"}), 500