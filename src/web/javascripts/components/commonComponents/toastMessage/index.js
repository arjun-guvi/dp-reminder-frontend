// Toast Message Component
import React from 'react';
import {
  Snackbar,
  Alert,
} from '@mui/material';

const ToastMessage = ({
  open = false,
  message = '',
  severity = 'info',
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        elevation={6}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastMessage;
