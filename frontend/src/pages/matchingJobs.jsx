import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MatchingJobs.css"; // Import du fichier CSS

const MatchingJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();


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

  const fetchMatchingJobs = async () => {
    try {
      // Retrieve the token from localStorage or sessionStorage
      const token = localStorage.getItem("userToken"); // Adjust based on where you store the JWT
  
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }
  
      // Make the request without the unnecessary "skills" field
      const response = await fetch("http://localhost:5000/match-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
  
      const data = await response.json();
      setJobs(data.top_jobs || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des matching jobs :", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleApply = (jobId) => {
    if (!candidateProfile || !candidateProfile.id) {
      console.error("Candidate profile or ID not available");
      return;
    }
    console.log("Navigating with candidate ID:", candidateProfile.id); // Debug here
    navigate(`/postuler/${jobId}`, {
      state: {
        candidateId: candidateProfile.id, // Pass candidate ID in state
      },
    });
  };

  useEffect(() => {
    fetchMatchingJobs();
  }, []);

  return (
    <div className="matching-jobs-container">
      <h1 className="title">Matching Jobs</h1>
      {isLoading ? (
        <p className="loading">Chargement des offres...</p>
      ) : jobs.length > 0 ? (
        <ul className="job-list">
          {jobs.map((job) => (
            <li key={job.id} className="job-item">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-description">{job.description}</p>
              <p className="job-skills">
                <strong>Compétences :</strong> {job.skills}
              </p>
              <p className="job-location">
                <strong>Lieu :</strong> {job.location}
              </p>
              <p className="job-type">
                <strong>Type :</strong> {job.type}
              </p>
              <p className="job-similarity">
                <strong>Similarité :</strong> {(job.similarity * 100).toFixed(2)}%
              </p>
              <button className="apply-button" onClick={() => handleApply(job.id)}>
                Postuler
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-jobs">Aucune offre correspondante trouvée.</p>
      )}
    </div>
  );
};

export default MatchingJobs;
