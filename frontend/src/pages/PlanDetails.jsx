import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
 
const PlanDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const name = queryParams.get("name");
  const price = queryParams.get("price");
 
  const handleConfirm = () => {
    navigate(`/Thanks?name=${name}&price=${price}`);
  };
 
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Détails du plan</h1>
      <p>
        <strong>Plan :</strong> {name}
      </p>
      <p>
        <strong>Prix :</strong> {price}€/mois
      </p>
      <button
        onClick={handleConfirm}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Confirmer
      </button>
    </div>
  );
};
 
export default PlanDetails