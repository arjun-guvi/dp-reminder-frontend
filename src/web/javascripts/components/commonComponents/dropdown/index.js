// Dropdown Component
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import './dropdown.scss';

const Dropdown = ({
  id,
  name,
  label = 'Select',
  value = '',
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = false,
  helperText = '',
  disabled = false,
  size = 'small',
  fullWidth = true,
  required = false,
}) => {
  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={error}
      disabled={disabled}
      className="dropdown"
    >
      <InputLabel id={`${id}-label`} required={required}>
        {label}
      </InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        name={name}
        value={value}
        label={label}
        onChange={onChange}
        displayEmpty
      >
        <MenuItem value="" disabled>
          <em>{placeholder}</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Dropdown;
