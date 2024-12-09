import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Start the webcam
  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => (videoRef.current.srcObject = stream))
      .catch((err) => console.error("Error accessing camera:", err));
  };

  // Capture photo from webcam
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
          console.log("Captured image file:", file);
          alert(" Photo Captured !")
        } else {
          console.error("Failed to capture image blob");
        }
      },
      "image/png"
    );
  };

  // Handle form submission
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
    formDataToSend.append("nom", formData.nom);
    formDataToSend.append("prenom", formData.prenom);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/api/candidate/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok) {
        alert(data.message || "Inscription réussie !");
        navigate("/");
      } else {
        alert(data.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="page-container">
      <div className="register-container">
        <h1>Création de compte</h1>
        <form onSubmit={handleSubmit} className="form-group">
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
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
          <button type="submit" className="login-button">
            Créer mon compte
          </button>

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

export default Register;
