import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DernieresOffres = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  
  const [dernieresOffres, setDernieresOffres] = useState([
    {
      id: 1,
      titre: "Développeur Frontend React",
      entreprise: "TechCorp",
      date: "26/11/2024",
      location: "Paris",
      type: "CDI",
      description: "Nous recherchons un développeur React expérimenté..."
    },
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }
  }, []);

  const handlePostuler = (id) => {
    const newOffres = dernieresOffres.filter(offre => offre.id !== id);
    setDernieresOffres(newOffres);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  return (
    <div className={`dernieres-offres-container ${theme}`}>
      <nav className="dashboard-nav">
        <div className="nav-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="white"/>
            </svg>
          </button>
          
        </div>
        <div className="nav-center">
          <h1>RECRUITMENT</h1>
        </div>
      </nav>

      <div className="dernieres-offres-content" style={{ marginTop: '80px' }}>
        <h2 className={theme}>Dernières Offres Publiées</h2>
        <div className="offres-grid">
          {dernieresOffres.map(offre => (
            <div key={offre.id} className={`offre-card ${theme}`}>
              <div className="offre-header">
                <h3 className={theme}>{offre.titre}</h3>
                <span className={`date-publication ${theme}`}>{offre.date}</span>
              </div>
              <div className="offre-details">
                <p className={`entreprise ${theme}`}>{offre.entreprise}</p>
                <p className={`location ${theme}`}>{offre.location}</p>
                <p className={`type ${theme}`}>{offre.type}</p>
              </div>
              <p className={`description ${theme}`}>{offre.description}</p>
              <div className="offre-actions">
                <button 
                  className={`postuler-btn ${theme}`} 
                  onClick={() => handlePostuler(offre.id)}
                >
                  Postuler
                </button>
                <button className={`details-btn ${theme}`}>
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DernieresOffres;