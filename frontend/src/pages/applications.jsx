import React, { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/applications.css"; // Importer le fichier CSS
 
 
const JobStats = () => {
  const [stats, setStats] = useState([]); // Liste des jobs
  const [similarities, setSimilarities] = useState([]); // Liste des similarités
  const [error, setError] = useState(""); // Erreur
  const [showChatbot, setShowChatbot] = useState(false); // Contrôle du chatbot
  const [chatMessages, setChatMessages] = useState([]); // Historique des messages
  const [userMessage, setUserMessage] = useState(""); // Message utilisateur
  const navigate = useNavigate();
 
 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Retrieve the token from localStorage or another secure location
        const token = localStorage.getItem("userToken");
  
        if (!token) {
          throw new Error("No token found. Please log in.");
        }
  
        // Make the request with the Authorization header
        const response = await fetch("http://localhost:5000/applications-stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token here
          },
        });
  
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);
        }
  
        const data = await response.json();
        setStats(data); // Charger les jobs
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques :", err);
        setError(err.message);
      }
    };
  
    fetchStats();
  }, []);
  
 
  const calculateSimilarities = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/calculate-similarity/${jobId}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      const data = await response.json();
      setSimilarities(data.results || []); // Charger les similarités
    } catch (err) {
      console.error("Erreur lors du calcul des similarités :", err);
      setError(err.message);
    }
  };
 
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
 
    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
 
    console.log("Contexte envoyé au backend :", similarities);
 
    try {
      const response = await fetch("http://localhost:5000/api/recruiter/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: similarities, // Envoyer les similarités comme contexte
        }),
      });
 
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors de l'envoi du message.");
 
      setChatMessages((prev) => [...prev, { sender: "bot", text: data.response }]);
    } catch (error) {
      console.error("Erreur :", error.message);
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Erreur lors de la réponse du serveur." },
      ]);
    } finally {
      setUserMessage(""); // Réinitialiser l'input utilisateur
    }
  };
 
 
  return (
    <div className="job-stats-container">
       
       {/* Navbar */}
      <nav className="navbar">
  <div className="nav-left">
    <button
      className="back-button"
      onClick={() => navigate("/recruiter-dashboard")}
    >
      ←
    </button>
  </div>
  <div className="nav-center">
    <h1 className="navbar-title">RECRUITMENT</h1>
  </div>
  </nav>
  <div className="job-content-container">
  <h2>Statistiques des Candidatures</h2>
</div>
      {error && <p className="error-message">Erreur : {error}</p>}
      <div className="job-list">
        {stats.map((job) => (
          <div key={job.job_id} className="job-block">
            <h3>{job.job_title}</h3>
            <p><strong>ID Job :</strong> {job.job_id}</p>
            <p><strong>Nombre de Candidatures :</strong> {job.num_applications}</p>
 
            <button
              className="calculate-button"
              onClick={() => calculateSimilarities(job.job_id)}
            >
              Calculer les Similarités
            </button>
          </div>
        ))}
      </div>
 
      {/* Afficher les similarités */}
      {similarities.length > 0 && ( 
        <div className="job-content-container">
          <h3>Résultats de Similarité</h3>
          <div className="job-list">
          {similarities.map((sim, index) => (
            <div key={index} className="job-block">
              <p><strong>ID Candidat :</strong> {sim.candidate_id}</p>
              <p><strong>Similarité CV :</strong> {(sim.cv_similarity * 100).toFixed(2)}%</p>
              <p><strong>Similarité Lettre :</strong> {(sim.letter_similarity * 100).toFixed(2)}%</p>
              <p><strong>Similarité Globale :</strong> {(sim.overall_similarity * 100).toFixed(2)}%</p>
              <p>
                <strong>CV :</strong>{" "}
                <a
                  href={`http://localhost:5000/${sim.cv_filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir le CV
                </a>
              </p>
              <p>
                <strong>Lettre :</strong>{" "}
                <a
                  href={`http://localhost:5000/${sim.cover_letter_filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Voir la Lettre
                </a>
              </p>
            </div>
          ))}</div>
        </div>
      )}
 
      {/* Icône de chatbot */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <FaRobot size={30} color="white" />
      </div>
 
      {/* Chatbot */}
      {showChatbot && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "300px",
            height: "400px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px",
              textAlign: "center",
            }}
          >
            Chatbot
          </div>
          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  margin: "10px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                    color: msg.sender === "user" ? "white" : "black",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex" }}>
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Posez une question..."
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px 0 0 5px",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userMessage.trim()}
              style={{
                padding: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "0 5px 5px 0",
                cursor: "pointer",
              }}
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default JobStats;
 
 
 