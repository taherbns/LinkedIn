const JobOffers = () => {
  const offers = [
    { id: 1, title: "Frontend Developer", description: "React, Redux" },
    { id: 2, title: "Backend Developer", description: "Node.js, Express" },
  ];

  return (
    <div>
      {offers.map((offer) => (
        <div key={offer.id}>
          <h3>{offer.title}</h3>
          <p>{offer.description}</p>
        </div>
      ))}
    </div>
  );
};

export default JobOffers;
