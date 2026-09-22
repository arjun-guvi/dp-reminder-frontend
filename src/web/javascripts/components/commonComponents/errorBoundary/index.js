// Error Boundary Component
import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import './errorBoundary.scss';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box className="error-boundary">
          <span className="error-boundary__icon" aria-hidden="true">!</span>
          <Typography variant="h5" className="error-boundary__title">
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" className="error-boundary__message">
            An unexpected error occurred. Please try again later.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            className="error-boundary__button"
          >
            Go to Home
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
