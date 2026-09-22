// Navbar Component with Logout
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Divider,
} from '@mui/material';
import { performLogoutAction } from '../../../redux/actions';
import ToastMessage from '../../commonComponents/toastMessage';
import './navbar.scss';

// SVG Icons as components
const AccountIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,3.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,6.35C8.66,6.59,8.12,6.92,7.63,7.31L5.24,6.35c-0.22-0.08-0.47,0-0.59,0.22L2.74,9.88 c-0.12,0.21-0.07,0.47,0.12,0.61l2.03,1.58C4.84,12.39,4.8,12.69,4.8,13s0.02,0.61,0.06,0.92l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

const Navbar = ({ title = 'Payment Dashboard' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.commonData);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    setIsLoggingOut(true);
    
    try {
      await dispatch(performLogoutAction(
        navigate,
        (message, severity) => setToast({ open: true, message, severity })
      ));
    } catch (error) {
      setToast({
        open: true,
        message: 'Logout completed',
        severity: 'success',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const handleSettings = () => {
    handleMenuClose();
    navigate('/settings');
  };
  
  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };
  
  return (
    <>
      <AppBar position="static" className="navbar" elevation={0}>
        <Toolbar className="navbar__toolbar">
          <Typography variant="h6" className="navbar__title">
            {title}
          </Typography>
          
          <Box className="navbar__actions">
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="navbar-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
              className="navbar__icon-button"
            >
              <AccountIcon />
              {user?.name && (
                <Typography variant="body2" className="navbar__username">
                  {user.name}
                </Typography>
              )}
            </IconButton>
            
            <Menu
              id="navbar-menu"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              className="navbar__menu"
            >
              {user && (
                <MenuItem disabled>
                  <Box className="navbar__user-info">
                    <Typography variant="body2" fontWeight="bold">
                      {user.name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email || ''}
                    </Typography>
                  </Box>
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleSettings}>
                <SettingsIcon />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogoutIcon />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <ToastMessage
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleToastClose}
      />
    </>
  );
};

export default Navbar;
