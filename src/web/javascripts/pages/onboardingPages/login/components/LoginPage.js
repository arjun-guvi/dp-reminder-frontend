// Login Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import { setAuthToken, setUser } from '../../../../redux/actions';
import { userApi } from '../../../../apiCalls';
import './LoginPage.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await userApi.login(formData);
      const payload = response?.data ?? response;
      const token = payload?.token || payload?.access_token || payload?.accessToken;

      if (!token) {
        throw new Error('The login response did not include an authentication token.');
      }

      const loggedInUser = payload.user || payload.account || {
        email: formData.email,
      };

      localStorage.setItem('authToken', token);
      dispatch(setAuthToken(token));
      dispatch(setUser(loggedInUser));

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.response?.data?.error
          || error.response?.data?.message
          || error.message
          || 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="login-page">
      <Paper elevation={3} className="login-page__paper">
        <Box className="login-page__header">
          <Typography component="h1" variant="h5" fontWeight={600}>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Please enter your credentials.
          </Typography>
        </Box>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          {errors.general && (
            <Typography color="error" variant="body2" className="login-page__error">
              {errors.general}
            </Typography>
          )}

          <Box className="login-page__options">
            <Link href="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="login-page__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box className="login-page__footer">
          <Typography variant="body2">
            Don&apos;t have an account?{' '}
            <Link href="/signup" variant="body2">
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
