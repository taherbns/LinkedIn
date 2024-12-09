const GenerateCoverLetter = () => {
  const handleGenerate = () => {
    alert("Cover letter generated!");
  };

  return (
    <div>
      <h2>Generate Cover Letter</h2>
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
};

export default GenerateCoverLetter;
