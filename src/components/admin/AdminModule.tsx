import { useAuth } from '../../context/AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';

const AdminModule = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {user ? <Dashboard /> : <Login />}
    </div>
  );
};

export default AdminModule; 