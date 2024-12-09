import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import  CandidateProfile from "./pages/CandidateProfile";
import RecruiterProfil from './pages/RecruiterProfil';
import RegisterRecruiter from "./pages/RegisterRecruiter";
import Jobs from "./pages/Jobs"
import ChatbotDynamic from "./pages/chatbotdynamique"
import MatchingJobs from "./pages/matchingJobs";
import Postuler from "./pages/postuler";
import ThankYou from "./pages/Thanks";
import ThankYouCa from "./pages/ThanksCa";
import PlanDetails from "./pages/PlanDetails";
import PlanDetailsCa from "./pages/PlanDetailsCa";
import Abonnements from "./pages/abonnements";
import AbonnementsCa from "./pages/abonnementsCa";
import NotificationOffres from './pages/NotificationOffres';
import Applications from "./pages/applications";
import "./styles/App.css";
import "./styles/Recruiter.css";
const App = () => {
  return (
    <Router>
      <Routes>
      
        <Route path="/" element={<Login />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/dernieres-offres" element={<NotificationOffres />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<CandidateProfile />} />
        <Route path="/profile-recruiter" element={<RecruiterProfil />} />
        <Route path="/register-recruiter" element={<RegisterRecruiter />} />
        <Route path="/chatbotdynamique" element={<ChatbotDynamic />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/matching-jobs" element={<MatchingJobs />} />
        <Route path="/postuler/:jobId" element={<Postuler />} />
        <Route path="/jobs/create" element={<Jobs />} />
        <Route path="/jobs/:id" element={<Jobs />} />
        <Route path="/jobs/:id/candidates" element={<Jobs />} />
        <Route path="/abonnements" element={<Abonnements />} />
        <Route path="/abonnementsCa" element={<AbonnementsCa />} />
        <Route path="/Thanks" element={<ThankYou />} />
        <Route path="/ThanksCa" element={<ThankYouCa />} />
        <Route path="/PlanDetails" element={<PlanDetails />} />
        <Route path="/PlanDetailsCa" element={<PlanDetailsCa />} />
        <Route path="/applications" element={<Applications />} />
      </Routes>
    </Router>
  );
};

export default App;
