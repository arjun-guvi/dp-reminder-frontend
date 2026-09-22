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
} from '@mui/material';
import { setAuthToken, setUser } from '../../../redux/actions';
import { userApi } from '../../../apiCalls';
import '../login/components/LoginPage.scss';

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '', general: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await userApi.signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      const payload = response?.data ?? response;
      const token = payload?.token || payload?.access_token || payload?.accessToken;

      if (!token) {
        throw new Error('The signup response did not include an authentication token.');
      }

      const signedUpUser = payload.user || payload.account || {
        name: formData.name.trim(),
        email: formData.email,
      };

      localStorage.setItem('authToken', token);
      dispatch(setAuthToken(token));
      dispatch(setUser(signedUpUser));
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        general: error.response?.data?.error
          || error.response?.data?.message
          || error.message
          || 'Signup failed. Please try again.',
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
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set up your account to start tracking payments.
          </Typography>
        </Box>

        <form className="login-page__form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="signup-email"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="signup-password"
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="confirm-password"
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          {errors.general && (
            <Typography color="error" variant="body2" className="login-page__error">
              {errors.general}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="login-page__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <Box className="login-page__footer" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/login" variant="body2">Sign in</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
