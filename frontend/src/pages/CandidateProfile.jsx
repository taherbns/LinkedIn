import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [theme] = useState(() => localStorage.getItem("theme") || "dark");

  const [profileData, setProfileData] = useState({
    fullName: "",
    address: "",
    skills: "",
    email: "",
    NumeroTelephone: "",
    aboutMe: "",
    avatar: null,
  });

  const [profileImage, setProfileImage] = useState(null);
  const [cv, setCv] = useState(null);
  const [skills, setSkills] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch candidate profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/candidate/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setProfileData({
            fullName: `${data.nom} ${data.prenom}`,
            address: data.address || "",
            skills: data.skills,
            email: data.email,
            NumeroTelephone: data.phone || "",
            aboutMe: data.aboutMe || "",
            avatar: data.avatar ? `http://localhost:5000/${data.avatar}` : null,
          });
          setProfileImage(data.avatar ? `http://localhost:5000/${data.avatar}` : null);
        } else {
          alert(data.message || "Erreur lors du chargement des données.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));

      const uploadImage = async () => {
        const formData = new FormData();
        formData.append("avatar", file);

        try {
          const response = await fetch("http://localhost:5000/api/candidate/avatar", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            alert(data.message || "Erreur lors du téléchargement de l'image.");
          }
        } catch (error) {
          console.error("Erreur lors du téléchargement de l'image:", error);
        }
      };

      uploadImage();
    }
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/candidate/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          address: profileData.address,
          phone: profileData.NumeroTelephone,
          aboutMe: profileData.aboutMe,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Informations mises à jour avec succès !");
      } else {
        alert(data.message || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className={`page-container ${theme}`}>
      <div className={`profile-container ${theme}`}>
        <h1 className="profile-title">PROFILE</h1>

        <div className="profile-content">
          <div className="profile-left">
            <div className="avatar-section">
              <div className="avatar-circle" onClick={() => document.getElementById("profile-image-input").click()}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  <div className="avatar-placeholder">+</div>
                )}
              </div>
              <input
                type="file"
                id="profile-image-input"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </div>

            <div className="contact-links">
              <div className="contact-info">
                <div className={`info-item ${theme}`}>
                  <span>{profileData.fullName}</span>
                </div>
                <div className={`info-item ${theme}`}>
                  <span>{profileData.address}</span>
                </div>
                <div className={`info-item ${theme}`}>
                  <span>{profileData.NumeroTelephone}</span>
                </div>
              </div>
            </div>


           

            <div className={`cv-section ${theme}`}>
              <h3>Curriculum Vitae</h3>
              <div className="cv-upload">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvUpload}
                  id="cv-upload"
                  className="file-input"
                  hidden
                />
                <label htmlFor="cv-upload" className="cv-upload-button">
                  {cv ? "Update CV" : "Upload CV"}
                </label>
                {cv && <p className={`cv-name ${theme}`}>{cv.name}</p>}
                <h4>Compétences extraites :</h4>
        {isLoading ? (
          <p>Extraction en cours...</p>
        ) : profileData.skills ? (
          <p>{profileData.skills}</p>
        ) : (
          <p>Aucune compétence extraite pour le moment.</p>
        )}
              </div>
            </div>
            <button className="back-button" onClick={() => navigate("/candidate-dashboard")}>
              Back to Dashboard
            </button>
          </div>

          <div className="profile-right">


          <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className={theme}>Full Name:</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  disabled
                  className={`input-disabled ${theme}`}
                />
              </div>

              <div className="form-group">
                <label className={theme}>E-mail:</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className={`input-disabled ${theme}`}
                />
              </div>

            <div className="form-group">
                <label className={theme}>Address:</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      address: e.target.value,
                    })
                  }
                  className={`input-enabled ${theme}`}
                />
              </div>

              <div className="form-group">
                <label>Numero Telephone:</label>
                <input
                  type="text"
                  value={profileData.NumeroTelephone}
                  onChange={(e) => setProfileData({ ...profileData, NumeroTelephone: e.target.value })}
                  className={`input-field ${theme}`}
                />
              </div>

              <div className="form-group">
                <label>About Me:</label>
                <textarea
                  value={profileData.aboutMe}
                  onChange={(e) => setProfileData({ ...profileData, aboutMe: e.target.value })}
                  className={`input-field ${theme}`}
                />
              </div>

              <button type="submit" className="update-button">
                Update Information
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
