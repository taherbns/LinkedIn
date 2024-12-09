import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfileRecruiter = () => {
  const navigate = useNavigate();
  const [theme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    document.body.className = savedTheme || "dark";
    return savedTheme || "dark";
  });

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    address: "",
    phoneNumber: "",
    avatar: null,
  });

  const [profileImage, setProfileImage] = useState(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/recruiter/profile", {
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
            email: data.email,
            address: data.company?.address || "",
            phoneNumber: data.phone || "",
            avatar: data.avatar ? `http://localhost:5000/${data.avatar}` : null, // Absolute path
          });
          setProfileImage(data.avatar ? `http://localhost:5000/${data.avatar}` : null); // Absolute path
        } else {
          alert(data.message || "Erreur lors du chargement des données.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleImageClick = () => {
    document.getElementById("profile-image-input").click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));

      // Optionally upload the image
      const uploadImage = async () => {
        const formData = new FormData();
        formData.append("avatar", file);

        try {
          const response = await fetch("http://localhost:5000/api/recruiter/avatar", {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/recruiter/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          phone: profileData.phoneNumber,
          address: profileData.address,
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
    <div className={`pagep-container ${theme}`}>
      <div className={`profile-container ${theme}`}>
        <h1 className={`profile-title ${theme}`}>PROFILE RECRUTEUR</h1>

        <div className="profile-content">
          <div className="profile-left">
            <div className="avatar-section">
              <div
                className={`avatar-circle ${theme}`}
                onClick={handleImageClick}
                title="Click to change image"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className={`avatar-placeholder ${theme}`}>
                    <svg className="avatar-icon" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
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

            <div className="info-section">
              <p className={`info-item ${theme}`}>{profileData.fullName}</p>
              <p className={`info-item ${theme}`}>{profileData.address}</p>
              <p className={`info-item ${theme}`}>{profileData.phoneNumber}</p>
            </div>

            <button
              className={`back-button ${theme}`}
              onClick={() => navigate("/recruiter-dashboard")}
            >
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
                <label className={theme}>Phone Number:</label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className={`input-enabled ${theme}`}
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

              <button type="submit" className={`update-button ${theme}`}>
                Update Information
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileRecruiter;
