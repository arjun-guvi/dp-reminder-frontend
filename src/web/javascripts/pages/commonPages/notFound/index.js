// Not Found Page (404)
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box className="not-found-page">
      <Typography variant="h1" className="not-found-page__code">
        404
      </Typography>
      <Typography variant="h5" className="not-found-page__title">
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" className="not-found-page__message">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Box className="not-found-page__actions">
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
