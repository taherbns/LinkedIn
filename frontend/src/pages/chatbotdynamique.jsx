import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chatbotdynamique.css"; // Fichier CSS pour gérer les thèmes
 
const ChatbotDynamic = ({ theme }) => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState(""); // L'utilisateur écrit directement la description
  const [coverLetterFile, setCoverLetterFile] = useState(null); // Téléversement pour la lettre
  const [context, setContext] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
 
  // Gestion du téléversement de la lettre
  const handleFileUpload = (e) => {
    setCoverLetterFile(e.target.files[0]);
  };
 
  // Envoi des données pour créer le contexte
  const sendDataToBackend = async () => {
    if (!jobDescription.trim() || !coverLetterFile) {
      setErrorMessage("Veuillez écrire la description de l'emploi et téléverser la lettre de motivation.");
      return;
    }
 
    setIsLoading(true);
    setErrorMessage("");
 
    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription); // Description écrite
      formData.append("cover_letter", coverLetterFile); // Lettre téléversée
 
      const response = await fetch("http://localhost:5000/upload-context", {
        method: "POST",
        body: formData,
      });
 
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi des données.");
 
      setContext(data.context);
      setChatMessages([{ sender: "bot", text: "Contexte chargé. Vous pouvez commencer à discuter." }]);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };
 
  // Envoi des messages utilisateur
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
 
    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setIsLoading(true);
 
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, context }),
      });
 
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi du message.");
 
      setChatMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (error) {
      console.error("Erreur :", error.message);
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Erreur dans la réponse du serveur." }]);
    } finally {
      setIsLoading(false);
      setUserMessage(""); // Réinitialiser l'input utilisateur
    }
  };
 
  return (
    <div className={`chatbot-dynamic ${theme}`}>
      <button
        onClick={() => navigate("/candidate-dashboard")} // Naviguer vers le dashboard
        className="return-dashboard-button"
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Retourner au Dashboard
      </button>
      <h1>Chatbot Dynamique</h1>
 
      {!context ? (
        <div className="context-setup">
          <h2>Créer le Contexte</h2>
          <label>
            <p>Écrire la description du poste :</p>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Description de l'emploi"
              className="job-description"
            />
          </label>
          <label>
            <p>Téléverser la lettre de motivation :</p>
            <input type="file" onChange={handleFileUpload} className="file-upload" />
          </label>
          <button onClick={sendDataToBackend} disabled={isLoading} className="submit-button">
            Charger le contexte
          </button>
          {isLoading && <p>Chargement...</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Écrivez un message..."
              className="chat-input"
            />
            <button onClick={sendMessage} disabled={isLoading} className="send-button">
              Envoyer
            </button>
          </div>
          {isLoading && <p>Chargement...</p>}
        </div>
      )}
    </div>
  );
};
 
export default ChatbotDynamic;
 
 