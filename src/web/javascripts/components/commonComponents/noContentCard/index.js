// No Content Card Component
import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import './noContentCard.scss';

const NoContentCard = ({
  message = 'No data available',
  description = '',
  icon: Icon,
  buttonText = '',
  onButtonClick,
}) => {
  return (
    <Box className="no-content-card">
      {Icon && <Icon className="no-content-card__icon" />}
      <Typography variant="h6" className="no-content-card__message">
        {message}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" className="no-content-card__description">
          {description}
        </Typography>
      )}
      {buttonText && (
        <Button
          variant="contained"
          onClick={onButtonClick}
          className="no-content-card__button"
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export default NoContentCard;
