import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFaceVerification, setIsFaceVerification] = useState(false);
  const [image, setImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Start camera for face verification
  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
    setIsFaceVerification(true);
  };

  // Capture photo for face verification
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
          alert(" Photo Captured !")
        } else {
          alert("Failed to capture photo");
        }
      },
      "image/png"
    );
  };

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    // Start face verification
    startCamera();
  };

  // Submit both credentials and face
  const handleSubmit = async () => {
    if (!image) {
      alert("Veuillez capturer une photo pour continuer.");
      return;
    }
    alert('Checking in Process !')
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("image", image);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login_with_face_and_credentials",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userEmail", data.user.email);

        if (data.user.role === "recruiter") {
          navigate("/recruiter-dashboard");
        } else if (data.user.role === "candidate") {
          navigate("/candidate-dashboard");
        } else {
          alert("Rôle utilisateur non reconnu");
        }
      } else {
        alert(data.message || "Erreur de connexion !");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Erreur lors de la connexion");
    }
  };
  
  const handleForgotPassword = () => {
    navigate("/reset-password");
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <h1>Connexion</h1>

        {!isFaceVerification ? (
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />

          <div className="forgot-password">
            <button
              onClick={handleForgotPassword}
              className="forgot-password-link"
              type="button"
            >
              Mot de passe oublié?
            </button>
          </div>
            <button onClick={handleLogin} className="login-button" type="button">
              Se connecter
            </button>
          </div>
        ) : (
          <div className="camera-container">
            <video ref={videoRef} autoPlay></video>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
            <button onClick={capturePhoto} className="capture-button">
              Capturer la photo
            </button>
            <button onClick={handleSubmit} className="login-button">
              Vérifier et se connecter
            </button>
          </div>
        )}
         <div className="register-section">
            <p>Pas encore de compte ?</p>
            <button
              onClick={() => navigate("/register")}
              className="register-button"
              type="button"
            >
              Créer un compte candidat
            </button>
            <button
              onClick={() => navigate("/register-recruiter")}
              className="register-button"
              type="button"
            >
              Créer un compte recruteur
            </button>
          </div>
          
      </div>
    </div>
  );
};

export default Login;
