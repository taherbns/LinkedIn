from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os


chatbotRecruiter = Blueprint('chatbotRecruiter', __name__)

# Charger les variables d'environnement
load_dotenv()


# Route pour le chatbot
@chatbotRecruiter.route('/api/recruiter/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        user_message = data.get("message")
        context = data.get("context", [])

        if not user_message:
            return jsonify({"error": "Message utilisateur manquant."}), 400

        # Vérifiez la structure du contexte
        print("Contexte reçu :", context)

        # Construire le contexte des similarités
        similarity_context = "\n".join(
            f"Candidat {sim.get('candidate_id', 'N/A')}: "
            f"Similarité CV: {sim.get('cv_similarity', 0) * 100:.2f}%, "
            f"Similarité Lettre: {sim.get('letter_similarity', 0) * 100:.2f}%, "
            f"Similarité Globale: {sim.get('overall_similarity', 0) * 100:.2f}%"
            for sim in context
        )

        # Prompt pour le modèle
        template = """
        Vous êtes un assistant intelligent chargé de recommander un candidat pour un poste basé sur les similarités suivantes :
        {similarity_context}
        Utilisez ces informations pour répondre aux questions suivantes :
        Utilisateur : {user_message}
        Assistant :
        """
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_template(template)

        from langchain_openai import ChatOpenAI
        from langchain_core.output_parsers import StrOutputParser

        # Configurer LangChain avec OpenAI
        llm = ChatOpenAI(model="gpt-3.5-turbo", streaming=False)
        chain = prompt | llm | StrOutputParser()

        # Exécuter le modèle avec le contexte et le message utilisateur
        response = chain.invoke({
            "similarity_context": similarity_context,
            "user_message": user_message
        })

        return jsonify({"response": response.strip()})
    except Exception as e:
        print("Erreur lors du traitement :", str(e))
        return jsonify({"error": f"Erreur inattendue : {str(e)}"}), 500

