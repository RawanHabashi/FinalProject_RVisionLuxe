import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default ProtectedRoute;