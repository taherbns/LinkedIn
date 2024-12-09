const SearchBar = ({ onSearch }) => {
  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  return <input type="text" placeholder="Search..." onChange={handleSearch} />;
};

export default SearchBar;
