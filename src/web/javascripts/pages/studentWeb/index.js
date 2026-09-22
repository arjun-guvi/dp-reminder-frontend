// Student Dashboard Page
import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

const StudentDashboard = () => {
  return (
    <Box className="student-page">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Student Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          View your courses and progress
        </Typography>
      </Box>
      <Typography>Student content goes here</Typography>
    </Box>
  );
};

export default StudentDashboard;
