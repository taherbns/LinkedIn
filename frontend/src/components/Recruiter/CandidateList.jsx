const CandidateList = () => {
  const candidates = [
    { id: 1, name: "John Doe", skills: ["React", "Node.js"] },
    { id: 2, name: "Jane Smith", skills: ["Python", "Django"] },
  ];

  return (
    <div>
      {candidates.map((candidate) => (
        <div key={candidate.id}>
          <h3>{candidate.name}</h3>
          <p>Skills: {candidate.skills.join(", ")}</p>
        </div>
      ))}
    </div>
  );
};

export default CandidateList;
