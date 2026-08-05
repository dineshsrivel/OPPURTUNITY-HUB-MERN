import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, token, isAuthenticated, loading } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isStudent = user?.role === 'student';
  const isAdmin   = user?.role === 'admin';

  const getDashboardPath = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  return { user, token, isAuthenticated, loading, handleLogout, isStudent, isAdmin, getDashboardPath };
};

export default useAuth;
