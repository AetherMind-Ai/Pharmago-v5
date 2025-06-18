import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not logged in or not a Delivery role
  if (!user || userData?.role !== 'Delivery') {
    navigate('/'); // Redirect to home or a forbidden page
    return null; // Prevent rendering
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Delivery Dashboard</h2>
        <p>Welcome, {userData?.fullName || user.email}!</p>
        {/* TODO: Add Delivery specific components and charts */}
        <p className="mt-4">This is a placeholder for the Delivery Dashboard content.</p>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
