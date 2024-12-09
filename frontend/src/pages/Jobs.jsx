import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
    const navigate = useNavigate();
    const [theme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });
    const [jobs, setJobs] = useState([]);
    const [showAddJobForm, setShowAddJobForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);

    // Charger les jobs depuis le backend Flask
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        fetch('http://localhost:5000/jobs', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch jobs');
                }
                return response.json();
            })
            .then((data) => setJobs(data))
            .catch((error) => console.error('Erreur lors du chargement des offres :', error));
    }, []);

    // Ajouter une nouvelle offre
    const handleAddJob = (e) => {
        e.preventDefault();
        const newJob = {
            title: e.target.title.value,
            description: e.target.description.value,
            skills: e.target.skills.value,
            location: e.target.location.value,
            type: e.target.type.value,
        };
        const token = localStorage.getItem('userToken');
        fetch('http://localhost:5000/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newJob),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Offre ajoutée :', data);
                setJobs([...jobs, { ...newJob, id: data.id }]);
                setShowAddJobForm(false);
            })
            .catch((error) => {
                console.error('Erreur lors de l\'ajout de l\'offre :', error);
                alert(`Erreur : ${error.message}`);
            });
    };

    // Supprimer une offre
    const handleDeleteJob = (id) => {
        fetch(`http://localhost:5000/jobs/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data.message);
                setJobs(jobs.filter((job) => job.id !== id)); // Mettre à jour la liste des offres
            })
            .catch((error) => {
                console.error('Erreur lors de la suppression de l\'offre :', error);
                alert(`Erreur : ${error.message}`);
            });
    };

    // Afficher le formulaire de mise à jour
    const handleShowUpdateForm = (job) => {
        setCurrentJob(job);
        setShowUpdateForm(true);
    };

    // Mettre à jour une offre
    const handleUpdateJob = (e, id) => {
        e.preventDefault();
        const updatedJob = {
            title: e.target.title.value,
            description: e.target.description.value,
            skills: e.target.skills.value,
            location: e.target.location.value,
            type: e.target.type.value,
        };

        fetch(`http://localhost:5000/jobs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedJob),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log(data.message);
                setJobs(
                    jobs.map((job) => (job.id === id ? { ...job, ...updatedJob } : job))
                );
                setShowUpdateForm(false);
            })
            .catch((error) => {
                console.error('Erreur lors de la mise à jour de l\'offre :', error);
                alert(`Erreur : ${error.message}`);
            });
    };

    return (
        <div className={`jobs-container ${theme}`}>
            <div className="jobs-header">
                <div className="header-left">
                    <button
                        className="back-button"
                        onClick={() => navigate('/recruiter-dashboard')}
                    >
                        Retour au dashboard
                    </button>
                </div>
                <h1>GESTION DES OFFRES D'EMPLOI</h1>
                <button
                    className="add-job-button"
                    onClick={() => setShowAddJobForm(true)}
                >
                    + Nouvelle offre
                </button>
            </div>

            <div className={`jobs-content ${theme}`}>
                <div className={`jobs-list-section ${theme}`}>
                    <h2 className={theme}>Offres publiées</h2>
                    <div className="jobs-list">
                        {jobs.map((job) => (
                            <div className={`job-card ${theme}`} key={job.id}>
                                <h3 className={theme}>{job.title}</h3>
                                <p className={theme}>{job.description}</p>
                                <p className={theme}>{job.skills}</p>
                                <div className={`job-details ${theme}`}>
                                    <span>Lieu: {job.location}</span>
                                    <span>Type: {job.type}</span>
                                </div>
                                <button
                                    className={`delete-button ${theme}`}
                                    onClick={() => handleDeleteJob(job.id)}
                                >
                                    Supprimer
                                </button>
                                <button
                                    className={`update-button ${theme}`}
                                    onClick={() => handleShowUpdateForm(job)}
                                >
                                    Modifier
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {showAddJobForm && (
                    <div className={`add-job-modal ${theme}`}>
                        <div className={`modal-content ${theme}`}>
                            <h2>Créer une nouvelle offre</h2>
                            <form className={`job-form ${theme}`} onSubmit={handleAddJob}>
                                <input
                                    name="title"
                                    type="text"
                                    placeholder="Titre du poste"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <textarea
                                    name="description"
                                    placeholder="Description du poste"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <input
                                    name="skills"
                                    type="text"
                                    placeholder="Compétences requises"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <input
                                    name="location"
                                    type="text"
                                    placeholder="Lieu"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <select
                                    name="type"
                                    className={`input-field ${theme}`}
                                    required
                                >
                                    <option value="">Type de contrat</option>
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                </select>
                                <div className="form-buttons">
                                    <button type="submit" className={`submit-button ${theme}`}>
                                        Publier l'offre
                                    </button>
                                    <button
                                        type="button"
                                        className={`cancel-button ${theme}`}
                                        onClick={() => setShowAddJobForm(false)}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showUpdateForm && (
                    <div className={`update-job-modal ${theme}`}>
                        <div className={`modal-content ${theme}`}>
                            <h2>Modifier une offre</h2>
                            <form
                                className={`job-form ${theme}`}
                                onSubmit={(e) => handleUpdateJob(e, currentJob.id)}
                            >
                                <input
                                    name="title"
                                    defaultValue={currentJob.title}
                                    type="text"
                                    placeholder="Titre du poste"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <textarea
                                    name="description"
                                    defaultValue={currentJob.description}
                                    placeholder="Description du poste"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <input
                                    name="skills"
                                    defaultValue={currentJob.skills}
                                    type="text"
                                    placeholder="Compétences requises"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <input
                                    name="location"
                                    defaultValue={currentJob.location}
                                    type="text"
                                    placeholder="Lieu"
                                    className={`input-field ${theme}`}
                                    required
                                />
                                <select
                                    name="type"
                                    defaultValue={currentJob.type}
                                    className={`input-field ${theme}`}
                                    required
                                >
                                    <option value="CDI">CDI</option>
                                    <option value="CDD">CDD</option>
                                    <option value="Stage">Stage</option>
                                </select>
                                <div className="form-buttons">
                                    <button type="submit" className={`submit-button ${theme}`}>
                                        Mettre à jour
                                    </button>
                                    <button
                                        type="button"
                                        className={`cancel-button ${theme}`}
                                        onClick={() => setShowUpdateForm(false)}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
