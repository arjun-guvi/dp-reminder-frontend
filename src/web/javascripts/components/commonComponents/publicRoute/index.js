// Public Route Component - redirects authenticated users
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = ({ children }) => {
  const { authToken } = useSelector((state) => state.commonData);

  // If user is authenticated, redirect to dashboard
  if (authToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
