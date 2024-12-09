import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const RegisterRecruiter = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyAddress: "",
  });
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "photo.png", { type: "image/png" });
          setImage(file);
          console.log("Captured image blob:", file);
          alert(" Photo Captured !")
        } else {
          console.error("Failed to capture image blob");
        }
      },
      "image/png"
    );
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
  
    if (!image) {
      alert("Veuillez capturer une photo pour terminer l'inscription.");
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append("company_name", formData.companyName);
    formDataToSend.append("company_email", formData.email);
    formDataToSend.append("recruiter_nom", formData.lastName);
    formDataToSend.append("recruiter_prenom", formData.firstName);
    formDataToSend.append("recruiter_email", formData.email);
    formDataToSend.append("recruiter_password", formData.password);
    formDataToSend.append("company_address", formData.companyAddress);
    formDataToSend.append("image", image);
  
    // Debug FormData
    for (let pair of formDataToSend.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  
    try {
      const response = await fetch(
        "http://localhost:5000/api/company_with_recruiter/register",
        {
          method: "POST",
          body: formDataToSend,
        }
      );
    
      console.log("Response status:", response.status);
      const text = await response.text(); // Read as plain text
      console.log("Response text:", text);
    
      if (response.ok) {
        alert("Inscription réussie !");
        navigate("/");
      } else {
        alert("Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'inscription");
    }
  }    
  

  return (
    <div className="page-container">
      <div className="register-container">
        <h1>Création de compte</h1>

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-group">
          <input
            type="text"
            name="lastName"
            placeholder="Nom"
            value={formData.lastName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="Prénom"
            value={formData.firstName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="companyName"
            placeholder="Nom de l'entreprise"
            value={formData.companyName}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="companyAddress"
            placeholder="Adresse de l'entreprise"
            value={formData.companyAddress}
            onChange={handleChange}
            className="input-field"
            required
          />
          </div>

          <div className="camera-container">
            <video ref={videoRef} autoPlay></video>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            <button type="button" className="capture-button" onClick={startCamera}>
              Démarrer la caméra
            </button>
            <button type="button" className="capture-button" onClick={capturePhoto}>
              Capturer la photo
            </button>
          </div>
        <div>
          <button type="submit" className="register-button">
            Créer mon compte
          </button>
        </div>
          <div className="login-link">
            <button
              type="button"
              className="register-button"
              onClick={() => navigate("/")}
            >
              Retour à la connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterRecruiter;
