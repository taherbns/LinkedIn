import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
 
const ThankYou = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const name = queryParams.get("name");
  const price = queryParams.get("price");
  const navigate = useNavigate();
  const handlenavigate = () => {
    navigate(`/recruiter-dashboard`);
  };
 
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Merci pour votre achat !</h1>
      <p>
        Vous avez souscrit au plan <strong>{name}</strong> pour <strong>{price}€/mois</strong>.
      </p>
      <p>Nous espérons que vous apprécierez nos services.</p>
 
      <button className="Merci-button" onClick={() => handlenavigate()}>
             merci
            </button>
 
    </div>
   
   
  );
};
 
export default ThankYou;