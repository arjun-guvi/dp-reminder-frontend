// Admin Dashboard Page
import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box className="admin-page">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your application
        </Typography>
      </Box>
      <Typography>Admin content goes here</Typography>
    </Box>
  );
};

export default AdminDashboard;
