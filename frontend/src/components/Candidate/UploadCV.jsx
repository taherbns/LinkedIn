const UploadCV = () => {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    console.log("Uploaded file:", file);
  };

  return (
    <div>
      <h2>Upload Your CV</h2>
      <input type="file" onChange={handleUpload} />
    </div>
  );
};

export default UploadCV;
