import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../styles/postuler.css"
const Postuler = () => {
  const { jobId } = useParams(); // Get jobId from the URL
  const location = useLocation(); // Access state passed via navigate
  const { candidateId } = location.state || {}; // Retrieve candidateId from state
  const [job, setJob] = useState(null);
  const [cv, setCv] = useState(null); // CV file
  const [coverLetter, setCoverLetter] = useState(null); // Cover letter file
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/job-details/${jobId}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
    
        // Check for invalid values in the data
        if (data.error) {
          throw new Error(data.error);
        }
    
        setJob(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  // Handle file uploads
  const handleCvUpload = (event) => {
    setCv(event.target.files[0]);
  };

  const handleCoverLetterUpload = (event) => {
    setCoverLetter(event.target.files[0]);
  };

  // Submit application
  const handleSubmit = async () => {
    if (!cv || !coverLetter) {
      setError("Veuillez téléverser à la fois un CV et une lettre de motivation.");
      return;
    }

    if (!candidateId) {
      setError("Candidate ID is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("job_id", jobId); // Field name: job_id
    formData.append("candidate_id", candidateId); // Field name: candidate_id
    formData.append("cv", cv); // Field name: cv
    formData.append("cover_letter", coverLetter); // Field name: cover_letter

    try {
      const response = await fetch("http://localhost:5000/apply", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage("Votre candidature a été envoyée avec succès !");
      } else {
        throw new Error("Erreur lors de l'envoi de votre candidature.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <p>Erreur : {error}</p>;
  }

  if (!job) {
    return <p>Chargement des détails du job...</p>;
  }

  return (
    <div className="postuler-container">
      <h2 id="job-title">Postuler à : {job.title}</h2>
      <p className="job-description">Description : {job.description}</p>
      <p className="job-skills">Compétences requises : {job.skills}</p>
      <p className="job-location">Lieu : {job.location}</p>
      <p className="job-type">Type : {job.type}</p>

      <div className="upload-section">
        <h3 className="upload-title">Téléverser votre CV :</h3>
        <input
          id="cv-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleCvUpload}
        />
      </div>

      <div className="upload-section">
        <h3 className="upload-title">Téléverser votre lettre de motivation :</h3>
        <input
          id="cover-letter-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleCoverLetterUpload}
        />
      </div>

      <button id="submit-application" onClick={handleSubmit}>
        Envoyer ma candidature
      </button>

      {successMessage && (
        <p id="success-message">{successMessage}</p>
      )}
    </div>
  );
};

export default Postuler;