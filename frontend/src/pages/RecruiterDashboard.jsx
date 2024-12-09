import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/buttonabonnement.css';
const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    document.body.className = savedTheme || 'dark';
    return savedTheme || 'dark';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    experience: '',
    location: '',
    skills: '',
    availability: ''
  });
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
 
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('http://localhost:5000/candidates');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur HTTP : ${response.status}`);
        }
        const data = await response.json();
        setCandidates(data);
        setFilteredCandidates(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des candidats :', error.message);
      }
    };
   
 
    fetchCandidates();
  }, []);

  const handleContact = async (candidate) => {
    const emailData = {
      recipient: candidate.email, // Assurez-vous que l'e-mail est bien défini
      subject: "Invitation pour un entretien",
      message: `
      Bonjour ${candidate.nom} ${candidate.prenom},
     
      Nous avons le plaisir de vous informer que votre profil a retenu notre attention pour une opportunité passionnante au sein de notre entreprise. Nous aimerions vous inviter à un entretien afin de discuter plus en détail de votre parcours et des possibilités de collaboration pour le poste de Développeur Web.
     
      Voici les informations pour organiser notre entretien :
      - **Lieu :** Paris, bureaux principaux
      - **Date et heure suggérées :** 12 décembre 2024 à 14h00
      - **Durée estimée :** 30 minutes
     
      Si cette date ne vous convient pas, n'hésitez pas à nous proposer une alternative. Vous pouvez nous joindre à tout moment à l'adresse suivante : recruiter@entreprise.com ou par téléphone au +33 1 23 45 67 89.
     
      Nous vous remercions de votre intérêt et espérons avoir l'occasion de vous rencontrer prochainement.
     
      Cordialement,
     
      L'équipe de recrutement
      [Entreprise Inc.]
      www.entreprise.com
              `,
    };
 
    console.log("Data envoyée :", emailData); // Vérifiez ce qui est envoyé
 
    try {
      const response = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'envoi de l'e-mail.");
      }
 
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Erreur lors de l’envoi de l’e-mail :", error.message);
      alert(error.message);
    }
  };




  useEffect(() => {
    const applyFilters = () => {
      const filtered = candidates.filter((candidate) => {
        const matchesExperience =
          !filters.experience || candidate.experience === filters.experience;
        const matchesSkills =
          !filters.skills ||
          candidate.skills.toLowerCase().includes(filters.skills.toLowerCase());
        const matchesAvailability =
          !filters.availability ||
          candidate.availability === filters.availability;
 
        return matchesExperience && matchesSkills && matchesAvailability;
      });
 
      setFilteredCandidates(filtered);
    };
 
    applyFilters();
  }, [filters, candidates]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme;
  }, [theme]);
 
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };
 
  const handleLogout = () => {
    navigate('/');
  };
 
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

 const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  return (
    <div className={`dashboard-container ${theme}`}>
      <nav className="dashboard-nav">
        <div className="navbar-left">
        <button
            className="abonnement"
            onClick={() => navigate('/abonnements')}
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
 
          <div className='applications'>
              <button onClick={() => navigate('/applications')} className={`applications-button ${theme}`}>applications</button>
            </div>
            
          <div className="Job">
            <button onClick={() => navigate('/Jobs')} className={`job-button ${theme}`}>
              Jobs
            </button>
         
 
          </div>
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
          <button className="nav-icon" onClick={() => navigate('/profile-recruiter')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
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
 
      {isSearchOpen && (
        <div className={`search-overlay ${theme}`}>
          <div className="search-header">
            <button className="close-search" onClick={toggleSearch}>
              <span>×</span> Close
            </button>
            <div className="nav-center">
              <h1>RECRUITMENT</h1>
            </div>
          </div>
          <div className="search-content">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Rechercher par compétences"
            className={`search-input ${theme}`}
            value={searchQuery}
            onChange={async (e) => {
              const value = e.target.value;
              setSearchQuery(value);
 
              if (value.length > 2) {
                try {
                  const response = await fetch(`http://localhost:5000/search-candidates?skill=${value}`);
                  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                  const data = await response.json();
                  setSearchResults(data);
                } catch (error) {
                  console.error('Erreur de recherche :', error);
                }
              } else {
                setSearchResults([]); // Réinitialiser les résultats si la saisie est courte
              }
            }}
          />
        </div>
      </div>
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map((candidate) => (
            <div key={candidate.id} className="candidate-card">
              <h4>{candidate.nom} {candidate.prenom}</h4>
              <p>Email: {candidate.email} </p>
              <div className="skills-container">
                {candidate.skills?.split(',').map((skill, index) => (
                  <span key={index} className={`skill-tag ${theme}`}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">Aucun résultat trouvé.</p>
        )}
      </div>
    </div>
  </div>
)}
 
      <div className={`dashboard-hero ${theme}`}>
        <div className="hero-content">
          <h2 className={theme}>ESPACE RECRUTEUR</h2>
          <p>Trouvez les meilleurs candidats pour vos postes</p>
        </div>
      </div>
 
      
 
      <div className={`dashboard-content ${theme}`}>
      <div className="candidates-section">
  <h3>Candidats Disponibles</h3>
  <div className="candidates-list">
    {filteredCandidates.map((candidate) => (
      <div key={candidate.id} className="candidate-card">
        <h4 className="candidate-name">
          {candidate.nom} {candidate.prenom}
        </h4>
        <p className="candidate-card">
          <h4>{candidate.email}</h4></p>
        <div className="skills-container">
          {candidate.skills?.split(',').map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill.trim()}
            </span>
          ))}
        </div>
        <button
        className="contact-button"
        onClick={() => handleContact(candidate)}
      >
        Contacter
      </button>
      </div>
    ))}
  </div>
</div>
 
 
        </div>
      </div>
   
  );
};
 
export default RecruiterDashboard;
 