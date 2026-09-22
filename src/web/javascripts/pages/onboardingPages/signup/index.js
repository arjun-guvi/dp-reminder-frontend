import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthToken, setUser } from '../../../redux/actions';
import { userApi } from '../../../apiCalls';

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

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: '',
      general: '',
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }

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

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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

      const token =
        payload?.token ||
        payload?.access_token ||
        payload?.accessToken;

      if (!token) {
        throw new Error(
          'The signup response did not include an authentication token.'
        );
      }

      const signedUpUser =
        payload.user ||
        payload.account || {
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
        general:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Signup failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses =
    '-w-full -rounded-xl -border -border-gray-200 ' +
    '-bg-white -px-3.5 -py-2.5 -text-sm -text-gray-900 ' +
    '-outline-none -transition-all ' +
    'placeholder:-text-gray-400 ' +
    'focus:-border-gray-400 focus:-ring-2 focus:-ring-gray-100';

  return (
    <main className="-flex -min-h-screen -w-full -items-center -justify-center -bg-[#f7f7f8] -px-4 -py-8">
      <div className="-w-full -max-w-[400px] -mt-10">

        {/* Brand / Header */}
        <div className="-mb-7 -text-center">
          <div className="-mx-auto -mb-3 -flex -h-10 -w-10 -items-center -justify-center -rounded-xl -bg-gray-900 -text-sm -font-semibold -text-white">
            P
          </div>

          <h1 className="-text-xl -font-semibold -tracking-tight -text-gray-900">
            Create your account
          </h1>

          <p className="-mt-1 -text-sm -text-gray-500">
            Set up your account to start tracking payments
          </p>
        </div>

        {/* Signup Card */}
        <div className="-rounded-2xl -border -border-gray-200 -bg-white -p-6 -shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:-p-7">

          {errors.general && (
            <div className="-mb-4 -rounded-xl -border -border-red-200 -bg-red-50 -px-3.5 -py-3 -text-sm -text-red-700">
              {errors.general}
            </div>
          )}

          <form
            className="-flex -flex-col -gap-4"
            onSubmit={handleSubmit}
          >
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="-mb-1.5 -block -text-sm -font-medium -text-gray-800"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                autoFocus
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={
                  inputBaseClasses +
                  (errors.name
                    ? ' -border-red-400 focus:-border-red-400 focus:-ring-red-50'
                    : '')
                }
              />

              {errors.name && (
                <p className="-mt-1.5 -text-xs -text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="-mb-1.5 -block -text-sm -font-medium -text-gray-800"
              >
                Email address
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={
                  inputBaseClasses +
                  (errors.email
                    ? ' -border-red-400 focus:-border-red-400 focus:-ring-red-50'
                    : '')
                }
              />

              {errors.email && (
                <p className="-mt-1.5 -text-xs -text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="-mb-1.5 -block -text-sm -font-medium -text-gray-800"
              >
                Password
              </label>

              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={
                  inputBaseClasses +
                  (errors.password
                    ? ' -border-red-400 focus:-border-red-400 focus:-ring-red-50'
                    : '')
                }
              />

              {errors.password && (
                <p className="-mt-1.5 -text-xs -text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="-mb-1.5 -block -text-sm -font-medium -text-gray-800"
              >
                Confirm password
              </label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={
                  inputBaseClasses +
                  (errors.confirmPassword
                    ? ' -border-red-400 focus:-border-red-400 focus:-ring-red-50'
                    : '')
                }
              />

              {errors.confirmPassword && (
                <p className="-mt-1.5 -text-xs -text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="-mt-1 -w-full -rounded-xl -bg-gray-900 -py-2.5 -text-sm -font-medium -text-white -transition-all hover:-bg-gray-800 active:-scale-[0.99] disabled:-cursor-not-allowed disabled:-opacity-50"
            >
              {isLoading ? (
                <span className="-flex -items-center -justify-center -gap-2">
                  <span className="-h-4 -w-4 -animate-spin -rounded-full -border-2 -border-white/30 -border-t-white" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="-my-1 -flex -items-center -gap-3">
            <div className="-h-px -flex-1 -bg-gray-200" />

            <span className="-text-[11px] -font-medium -text-gray-400">
              OR
            </span>

            <div className="-h-px -flex-1 -bg-gray-200" />
          </div>

          {/* Login */}
          <div className="-text-center">
            <p className="-text-sm -text-gray-500">
              Already have an account?{' '}
              <a
                href="/login"
                className="-font-medium -text-gray-900 hover:-underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="-mt-6 -text-center -text-xs -text-gray-400">
          Secure access to your payment dashboard
        </p>
      </div>
    </main>
  );
};

export default SignupPage;
