from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
import os

chatbotdynamique = Blueprint('chatbotdynamique', __name__)
# Charger les variables d'environnement
load_dotenv()

# Initialiser Flask et CORS

@chatbotdynamique.route('/upload-context', methods=['POST'])
def upload_context():
    """Accepte une description écrite et un fichier téléversé pour créer le contexte."""
    try:
        job_description = request.form.get("job_description")
        cover_letter_file = request.files.get("cover_letter")

        if not job_description or not cover_letter_file:
            return jsonify({"error": "Description ou lettre manquante."}), 400

        # Lire le contenu du fichier téléversé
        cover_letter_content = None
        for encoding in ['utf-8', 'latin-1', 'iso-8859-1']:
            try:
                cover_letter_content = cover_letter_file.read().decode(encoding)
                break
            except UnicodeDecodeError:
                continue

        if cover_letter_content is None:
            return jsonify({"error": "Impossible de décoder le fichier téléversé."}), 400

        # Construire le contexte
        context = f"Description du poste : {job_description}\nLettre de motivation : {cover_letter_content}"
        return jsonify({"context": context})
    except Exception as e:
        print("Erreur lors du traitement :", str(e))
        return jsonify({"error": f"Erreur lors du traitement : {str(e)}"}), 500

@chatbotdynamique.route('/chat', methods=['POST'])
def chat():
    """Gère la conversation avec LangChain et OpenAI en utilisant le contexte et les messages utilisateur."""
    try:
        data = request.json  # Charger les données JSON
        user_message = data.get("message")
        context = data.get("context")

        if not user_message or not context:
            return jsonify({"error": "Message utilisateur ou contexte manquant."}), 400

        # Construire le prompt
        template = """
        Vous êtes un assistant utile spécialisé dans l'aide à la rédaction de lettres de motivation.
        Voici le contexte et les messages reçus :
        {chat_history}
        """
        prompt = ChatPromptTemplate.from_template(template)

        # Configurer LangChain avec OpenAI
        llm = ChatOpenAI(model="gpt-3.5-turbo", streaming=False)
        chain = prompt | llm | StrOutputParser()

        # Construire l'historique des messages pour LangChain
        formatted_history = f"Contexte : {context}\nUtilisateur : {user_message}"

        # Exécution de la chaîne
        response = chain.invoke({"chat_history": formatted_history})

        if isinstance(response, str):
            return jsonify({"response": response.strip()})
        else:
            return jsonify({"error": "La réponse retournée par LangChain n'est pas valide."}), 500
    except Exception as e:
        print("Erreur lors du traitement :", str(e))
        return jsonify({"error": f"Erreur inattendue : {str(e)}"}), 500