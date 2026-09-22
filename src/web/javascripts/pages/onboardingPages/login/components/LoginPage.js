import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthToken, setUser } from '../../../../redux/actions';
import { userApi } from '../../../../apiCalls';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (rememberMe && savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (name !== 'rememberMe') {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        general: '',
      }));
    }
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await userApi.login({
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
          'The login response did not include an authentication token.'
        );
      }

      const loggedInUser = payload.user ||
        payload.account || {
          email: formData.email,
        };

      localStorage.setItem('authToken', token);

      if (formData.rememberMe) {
        localStorage.setItem('savedEmail', formData.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
      }

      dispatch(setAuthToken(token));
      dispatch(setUser(loggedInUser));

      const from = location.state?.from?.pathname || '/dashboard';

      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid email or password.';
            break;

          case 401:
            errorMessage =
              'Invalid credentials. Please check your email and password.';
            break;

          case 403:
            errorMessage =
              'Account not verified. Please check your email for verification link.';
            break;

          case 429:
            errorMessage =
              'Too many login attempts. Please try again later.';
            break;

          case 500:
            errorMessage =
              'Server error. Please try again later.';
            break;

          default:
            errorMessage =
              error.response.data?.error ||
              error.response.data?.message ||
              errorMessage;
        }
      } else if (error.request) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      setErrors({
        general: errorMessage,
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
      <div className="-w-full -max-w-[400px]">

        {/* Brand / Header */}
        <div className="-mb-7 -text-center">
          <div className="-mx-auto -mb-3 -flex -h-10 -w-10 -items-center -justify-center -rounded-xl -bg-gray-900 -text-sm -font-semibold -text-white">
            P
          </div>

          <h1 className="-text-xl -font-semibold -tracking-tight -text-gray-900">
            Welcome back
          </h1>

          <p className="-mt-1 -text-sm -text-gray-500">
            Sign in to continue to your account
          </p>
        </div>

        {/* Login Card */}
        <div className="-rounded-2xl -border -border-gray-200 -bg-white -p-6 -shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:-p-7">

          {errors.general && (
            <div className="-mb-4 -rounded-xl -border -border-red-200 -bg-red-50 -px-3.5 -py-3 -text-sm -text-red-700">
              {errors.general}
            </div>
          )}

          <form
            className="-flex -flex-col -gap-5"
            onSubmit={handleSubmit}
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="-mb-1.5 -block -text-sm -font-medium -text-gray-800"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
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
              <div className="-mb-1.5 -flex -items-center -justify-between">
                <label
                  htmlFor="password"
                  className="-text-sm -font-medium -text-gray-800"
                >
                  Password
                </label>

                <a
                  href="/forgot-password"
                  className="-text-xs -font-medium -text-gray-500 hover:-text-gray-900"
                >
                  Forgot password?
                </a>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

            {/* Remember Me */}
            <label className="-flex -cursor-pointer -items-center -gap-2.5 -text-sm -text-gray-600">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="-h-4 -w-4 -rounded -border-gray-300 -accent-gray-900"
              />

              <span>Remember me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="-mt-1 -w-full -rounded-xl -bg-gray-900 -py-2.5 -text-sm -font-medium -text-white -transition-all hover:-bg-gray-800 active:-scale-[0.99] disabled:-cursor-not-allowed disabled:-opacity-50"
            >
              {isLoading ? (
                <span className="-flex -items-center -justify-center -gap-2">
                  <span className="-h-4 -w-4 -animate-spin -rounded-full -border-2 -border-white/30 -border-t-white" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
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

          {/* Sign Up */}
          <div className="-text-center">
            <p className="-text-sm -text-gray-500">
              Don&apos;t have an account?{' '}
              <a
                href="/signup"
                className="-font-medium -text-gray-900 hover:-underline"
              >
                Sign up
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

export default LoginPage;