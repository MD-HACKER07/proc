import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from './Login';
import AdminRegister from './AdminRegister';
import Dashboard from './Dashboard';

interface AdminModuleProps {
  onHomeClick?: () => void;
}

const AdminModule = ({ onHomeClick }: AdminModuleProps) => {
  const { loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Check if admin is logged in via our custom session
  // ONLY check for admin session, not Firebase user status
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // ONLY allow access if admin is logged in via our custom session
  // Regular Firebase users should NOT be able to access admin dashboard
  if (isAdminLoggedIn) {
    return <Dashboard />;
  }
  
  // If not logged in, show either login or registration form
  return (
    <div>
      {isRegistering ? (
        <AdminRegister 
          onLoginClick={() => setIsRegistering(false)} 
        />
      ) : (
        <Login onRegisterClick={() => setIsRegistering(true)} onHomeClick={onHomeClick} />
      )}
    </div>
  );
};

export default AdminModule;