import PyPDF2
import docx
from flask import Flask, Blueprint, request, jsonify
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from flask_cors import CORS
 
cv_processor = Blueprint('cv_processor', __name__)
 

# Prompt 1 : Extraction initiale
prompt1_template = """tu es mon chatbot je tenvoie un cv de nimporte quelle condidat , il faut vraiment que tu cherche dans le texte la partie competences ou skills et extraire ce texte et l'afficher , il faut ce concentrer que sur les comptences
ainsi je veux que tu les envois directements sans introduction ni debut ni fin ni rien dautre que le texte de competences , tu ne dois pas envoyér autre chose d'autre que le texte de competences
et pour les comptences tu ne doit pas inclure langues parlé , diplomes , certifications , hobbies ou quoi ce soit dautre que les comptences .donc je veux que des comptences seulement , je veux que ca soit en texte , sans titre ni rien de plus .
 
Resume Text: {context}
 
Answer:"""
model1 = OllamaLLM(model="llama3.2")
prompt1 = ChatPromptTemplate.from_template(prompt1_template)
chain1 = prompt1 | model1
 
# Prompt 2 : Nettoyage des compétences
prompt2_template = """tu es un chatbot très strict. Je t'envoie un texte contenant des compétences et peut-être d'autres informations inutiles. Ne garde pas les informations inutiles, et affiche que les compétences professionnelles
Ne garde pas ces textes :
- de langues (comme francais, anglais, espagnol, arabe etc...)
- de titres
- des sous titres
- Les langues parlées
- Les certifications
- Les diplômes
- Les hobbies
- Les phrases d'introduction ou de conclusion
je veux juste des compétences sans titres sans introduction je veux juste des compétences sans introduction ni debut ni fin ni rien dautre que le texte de competences
 
Texte : {context}
 
Answer:"""
model2 = OllamaLLM(model="llama3.2")
prompt2 = ChatPromptTemplate.from_template(prompt2_template)
chain2 = prompt2 | model2
 
# Fonction pour extraire le texte d'un PDF
def extract_text_from_pdf(pdf_file):
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text
 
# Fonction pour extraire le texte d'un fichier DOCX
def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text
 
# Extraction initiale des compétences
def extract_raw_skills(resume_text):
    result = chain1.invoke({"context": resume_text})
    return result.strip()
 
# Nettoyage des compétences
def clean_skills(raw_skills_text):
    result = chain2.invoke({"context": raw_skills_text})
    return result.strip()
 
@cv_processor.route('/upload-cv', methods=['POST'])
def upload_cv():
    try:
        file = request.files['file']
        file_type = file.filename.split('.')[-1].lower()
        print(f"Fichier reçu : {file.filename}, type : {file_type}")
 
        # Extraction du texte brut
        if file_type == 'pdf':
            resume_text = extract_text_from_pdf(file)
        elif file_type == 'docx':
            resume_text = extract_text_from_docx(file)
        elif file_type == 'txt':
            resume_text = file.read().decode("utf-8")
        else:
            return jsonify({"skills": "Type de fichier non pris en charge."}), 400
 
        if not resume_text.strip():
            return jsonify({"skills": "Le fichier est vide ou illisible."}), 400
 
        print(f"Texte extrait : {resume_text}...")  # Aperçu du texte
 
        # Étape 1 : Extraction brute des compétences
        raw_skills = extract_raw_skills(resume_text)
        print(f"Compétences brutes : {raw_skills}")
 
        if not raw_skills.strip():
            return jsonify({"skills": "Aucune compétence brute détectée."}), 400
 
        # Étape 2 : Nettoyage des compétences
        cleaned_skills = clean_skills(raw_skills)
        print(f"Compétences nettoyées : {cleaned_skills}")
 
        if not cleaned_skills.strip():
            return jsonify({"skills": "Aucune compétence finale détectée."}), 400
 
        # Retourner les compétences nettoyées
        return jsonify({"skills": cleaned_skills})
 
    except Exception as e:
        print(f"Erreur : {e}")
        return jsonify({"skills": "Erreur lors de l'extraction des compétences."}), 500
 
