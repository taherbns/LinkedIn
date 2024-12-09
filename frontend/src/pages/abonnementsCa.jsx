import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/subscription.css";
 
const Abonnements = () => {
  const navigate = useNavigate();
 
  const plans = [
    {
      name: "Basic",
      features: ["Accès à l'outil de correspondance automatique", "Suggestions basiques"],
      price: 10,
    },
    {
      name: "Pro",
      features: ["Génération de lettres de motivation personnalisées pour chaque offre"],
      price: 25,
    },
    {
      name: "Enterprise",
      features: ["Chatbot IA intégré", "Rapports d’analyse avancée"],
      price: 50,
    },
  ];
 
  const handleSubscribe = (plan) => {
    navigate(`/PlanDetailsCa?name=${plan.name}&price=${plan.price}`);
  };
 
  return (
    <div className="subscription-container">
      <h2>Choisissez votre Abonnement</h2>
      <div className="plans">
        {plans.map((plan, index) => (
          <div key={index} className="plan">
            <h3>{plan.name}</h3>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
            <p className="price">{plan.price}€/mois</p>
            <button className="subscribe-button" onClick={() => handleSubscribe(plan)}>
              Voir les détails
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default Abonnements;
 
 