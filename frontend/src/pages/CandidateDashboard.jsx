import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import {Link} from "react-router-dom";
 
const CandidateDashboard = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    document.body.className = savedTheme || 'dark';
    return savedTheme || 'dark';
  });
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [cv, setCv] = useState(null);
  const [skills, setSkills] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [step, setStep] = useState(0);
  const [jobOffer, setJobOffer] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [letterContent, setLetterContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [optimizedLetter, setOptimizedLetter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [offres, setOffres] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false); // Gère la visibilité de la recherche
  const [newJobsCount, setNewJobsCount] = useState(0);
 
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);
 
  useEffect(() => {
    const fetchOffres = async () => {
        try {
           
 
            const response = await fetch("http://localhost:5000/api/candidate/jobs", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                },
            });
 
            console.log("Response Headers:", response.headers);
 
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
 
            const data = await response.json();
            console.log("Fetched Data:", data);
            setOffres(data);
        } catch (error) {
            console.error("Erreur lors du chargement des offres :", error);
            setErrorMessage("Impossible de charger les offres.");
        }
    };
 
    fetchOffres();
}, []);
 
 
 
 
  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/candidate/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });
 
        if (!response.ok) {
          throw new Error("Failed to fetch candidate profile.");
        }
 
        const data = await response.json();
        console.log("Fetched Candidate Profile:", data); // Debug here
        setCandidateProfile(data); // Set candidate profile
      } catch (error) {
        console.error("Error fetching candidate profile:", error);
        setErrorMessage("Unable to fetch candidate profile.");
      }
    };
 
    fetchCandidateProfile();
  }, []);
 
 
 
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };
 
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
  };
 
  const handleLogout = () => {
    navigate("/");
  };
 
  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
    if (!showChatbot) setStep(0);
  };
 
  const handleCvUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setCv(file);
      const formData = new FormData();
      formData.append("file", file);
 
      setIsLoading(true);
      setSkills("");
 
      try {
        // Step 1: Extract skills using the chatbot API
        const response = await fetch("http://localhost:5000/upload-cv", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        const extractedSkills = data.skills;
 
        // Display extracted skills
        setSkills(extractedSkills);
 
        // Step 2: Send extracted skills to the backend to update the candidate profile
        const updateResponse = await fetch("http://localhost:5000/api/candidate/skills", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify({ skills: extractedSkills }),
        });
 
        const updateData = await updateResponse.json();
        if (!updateResponse.ok) {
          throw new Error(updateData.message || "Erreur lors de la mise à jour des compétences.");
        }
 
        alert("Compétences mises à jour avec succès !");
      } catch (error) {
        console.error("Erreur lors de l'extraction ou de la mise à jour des compétences :", error);
        setSkills("Erreur lors de l'extraction ou de la mise à jour des compétences.");
      } finally {
        setIsLoading(false);
      }
    }
  };
 
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
 
    const reader = new FileReader();
    reader.onload = (event) => {
      setLetterContent(event.target.result);
    };
    reader.readAsText(file);
  };
 
  const analyzeLetter = async () => {
    setIsLoading(true);
    setErrorMessage("");
 
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile); // Ajoutez le fichier
      formData.append("job_description", jobOffer); // Ajoutez la description
 
      const response = await fetch("http://localhost:5000/analyze-letter", {
        method: "POST",
        body: formData, // Utilisez FormData ici
      });
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'analyse");
      }
 
      const data = await response.json();
      setFeedback(data.feedback || "Aucune suggestion trouvée.");
      setStep(4); // Passe à l'étape des résultats
    } catch (error) {
      console.error("Erreur lors de l'analyse :", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };
 
 
  const generateLetter = async () => {
    setIsLoading(true);
    setErrorMessage("");
 
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile); // Ajoutez le fichier
      formData.append("job_description", jobOffer); // Ajoutez la description
 
      const response = await fetch("http://localhost:5000/generate-letter", {
        method: "POST",
        body: formData, // Utilisez FormData ici
      });
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération");
      }
 
      const data = await response.json();
      setOptimizedLetter(data.new_letter || "Erreur de génération.");
      setStep(5); // Passe à l'étape des résultats
    } catch (error) {
      console.error("Erreur lors de la génération :", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };
 
 
  const downloadOptimizedLetter = async () => {
    try {
      const response = await fetch("http://localhost:5000/download-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_letter: optimizedLetter }),
      });
 
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "lettre_optimisee.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement de la lettre optimisée :", error);
    }
  };
 
  const handleApply = (offre) => {
    if (!candidateProfile || !candidateProfile.id) {
      console.error("Candidate profile or ID not available");
      return;
    }
    console.log("Navigating with candidate ID:", candidateProfile.id); // Debug here
    navigate(`/postuler/${offre.id}`, {
      state: {
        candidateId: candidateProfile.id, // Pass candidate ID in state
      },
    });
  };
  return (
    <div className={`dashboard-container ${theme}`}>
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-left">
        <button
            className="abonnement"
            onClick={() => navigate('/abonnementsCa')}
          >
            Abonnement
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            <div className="theme-icon">
              <div className={`theme-circle ${theme}`}>
                <div className="theme-half light"></div>
                <div className="theme-half dark"></div>
              </div>
            </div>
          </button>
        </div>
        <div className="nav-center">
          <h1>RECRUITMENT</h1>
        </div>
        <div className="nav-right">
          <button className="nav-icon" onClick={toggleSearch}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button className="nav-icon" onClick={() => navigate('/Profile')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <button className="nav-icon notification-icon" onClick={() => navigate('/dernieres-offres')}>
            <div className="notification-container">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {newJobsCount > 0 && (
                <span className="notification-badge">{newJobsCount}</span>
              )}
            </div>
          </button>
          <button className="nav-icon robot-icon" onClick={() => navigate('/chatbotdynamique')}>
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="10" width="10" height="10" rx="2" ry="2"></rect>
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="8" y1="4" x2="10" y2="6"></line>
    <line x1="16" y1="4" x2="14" y2="6"></line>
    <circle cx="9" cy="14" r="1"></circle>
    <circle cx="15" cy="14" r="1"></circle>
    <line x1="9" y1="17" x2="15" y2="17"></line>
  </svg>
</button>
 
 
 
          <button className="nav-icon" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
         
 
       
        </div>
      </nav>
 
      <div className={`dashboard-hero ${theme}`}>
        <div className="hero-content">
          <h2 className={theme}>ESPACE CANDIDAT</h2>
          <p>Découvrez les offres qui correspondent à votre profil</p>
        </div>
      </div>
 
      <div className={`dashboard-content ${theme}`}>
        {/* Section CV */}
        <div className={`cv-section ${theme}`}>
          <h3>MON CV</h3>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} id="cv-upload"  />
          <label htmlFor="cv-upload" className={`upload-button ${theme}`}>
            {cv ? 'MODIFIER MON CV' : 'TÉLÉCHARGER MON CV'}
          </label>
          {cv && <p className={`cv-name ${theme}`}>CV actuel : {cv.name}</p>}
          <h4>Compétences extraites :</h4>
          {isLoading ? (
            <p>Extraction en cours...</p>
          ) : skills ? (
            <p>{skills}</p>
          ) : (
            <p>Aucune compétence extraite pour le moment.</p>
          )}
        </div>
       
        {/* Section Offres d'Emploi */}
        <div className={`offres-section ${theme}`}>
          <h3>OFFRES DISPONIBLES</h3>
          <div className={`buttonMatch ${theme}`}>
  <button
    onClick={() => navigate("/matching-jobs")}
    className={`abonnement ${theme}`}
  >
    Voir Matching Jobs
  </button>
</div>
{errorMessage && (
  <p style={{ color: theme === "dark" ? "red" : "darkred" }}>{errorMessage}</p>
)}
{offres.length === 0 ? (
  <p className={`no-offers-message ${theme}`}>
    Aucune offre disponible pour le moment.
  </p>
) : (
  offres.map((offre) => (
    <div key={offre.id} className={`offre-card ${theme}`}>
      <h4 className={`offre-title ${theme}`}>{offre.title}</h4>
      <p className={`offre-location ${theme}`}>Lieu : {offre.location}</p>
      <p className={`offre-description ${theme}`}>{offre.description}</p>
      <p className={`offre-skills ${theme}`}>{offre.skills}</p>
      <p className={`offre-type ${theme}`}>{offre.type}</p>
      <button
          className={`abonnement ${theme}`}
          onClick={() => handleApply(offre)}
        >
          Postuler
        </button>
    </div>
  ))
)}
</div>
 
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
     
       {/* Bouton Chatbot */}
        <div className="chatbot-button" onClick={toggleChatbot}>
          <FaRobot size={30} color="white" />
        </div>
 
        {showChatbot && (
          <div className="chatbot-container">
            <div className="chatbot-header">
              Chatbot
            </div>
            <div className="chatbot-content">
              {step === 0 && (
                <div>
                  <p>Bonjour ! Je suis votre assistant pour les lettres de motivation.</p>
                  <button onClick={() => setStep(1)}>Commencer</button>
                </div>
              )}
              {step === 1 && (
                <div>
                  <p>Entrez la description de l'offre d'emploi :</p>
                  <textarea
                    value={jobOffer}
                    onChange={(e) => setJobOffer(e.target.value)}
                    placeholder="Description de l'offre"
                  />
                  <button onClick={() => setStep(0)}>Retour</button>
                  <button onClick={() => setStep(2)}>Suivant</button>
                </div>
              )}
              {step === 2 && (
                <div>
                  <p>Téléversez votre lettre de motivation :</p>
                  <input type="file" accept=".docx" onChange={handleFileUpload} />
                  {uploadedFile && <p>Fichier téléversé : {uploadedFile.name}</p>}
                  <button onClick={() => setStep(1)}>Retour</button>
                  <button disabled={!uploadedFile} onClick={() => setStep(3)}>Suivant</button>
                </div>
              )}
              {step === 3 && (
                <div>
                  <p>Choisissez une action :</p>
                  <button onClick={analyzeLetter}>Analyser et améliorer</button>
                  <button onClick={generateLetter}>Générer une nouvelle lettre</button>
                  <button onClick={() => setStep(2)}>Retour</button>
                </div>
              )}
              {isLoading && <p>Chargement...</p>}
              {step === 4 && feedback && (
                <div>
                  <p>Suggestions d'amélioration :</p>
                  <textarea readOnly value={feedback} />
                  <button onClick={() => setStep(3)}>Retour</button>
                </div>
              )}
              {step === 5 && optimizedLetter && (
                <div>
                  <p>Nouvelle lettre générée :</p>
                  <textarea readOnly value={optimizedLetter} />
                  <button onClick={downloadOptimizedLetter}>Télécharger</button>
                  <button onClick={() => setStep(3)}>Retour</button>
                </div>
              )}
            </div>
            <button className="chatbot-close" onClick={toggleChatbot}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default CandidateDashboard;
 
 