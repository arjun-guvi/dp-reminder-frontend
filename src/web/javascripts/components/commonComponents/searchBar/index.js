// Search Bar Component
import React, { useState } from 'react';
import { TextField } from '@mui/material';
import './searchBar.scss';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  onSearch,
  fullWidth = false,
  size = 'small',
  disabled = false,
  autoFocus = false,
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch?.(localValue);
    }
  };

  return (
    <TextField
      className="search-bar"
      fullWidth={fullWidth}
      size={size}
      variant="outlined"
      placeholder={placeholder}
      value={value || localValue}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
};

export default SearchBar;
