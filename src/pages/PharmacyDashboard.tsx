import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaPlusCircle, FaBox, FaUsers, FaChartLine, FaFileAlt, FaCog, FaBars, FaTimes, FaDollarSign, FaChartBar, FaRedo, FaListAlt, FaCoins, FaUserAlt, FaSignOutAlt } from 'react-icons/fa';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Import Filler plugin
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // Register Filler plugin
);

const PharmacyDashboard: React.FC = () => {
  const { user, userData, loading, signOutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To highlight active link
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/login'); // Redirect to login page after sign out
    } catch (error) {
      console.error('Sign out failed:', error);
      // Optionally show an error message to the user
    }
  };

  // Function to abbreviate pharmacy name
  const getAbbreviatedName = (name: string | undefined) => {
    if (!name) return 'Pharmacy';
    return name.split(' ').slice(0, 2).join(' ');
  };

  useEffect(() => {
    if (!loading && (!user || !userData || userData.role !== 'pharmacy')) {
      // Primary redirect logic is in ProtectedRoute, this is a fallback.
      // navigate('/');
    }
  }, [user, userData, loading, navigate]);

  if (loading || !user || !userData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>; // A more user-friendly loading state
  }

  const pharmacyInfo = userData.pharmacyInfo;

  // --- Chart Data (Placeholder) ---
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales (EGP)',
        data: [120, 190, 300, 500, 230, 340, 450],
        borderColor: 'rgb(74, 222, 128)', // green-400
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        tension: 0.4, // Makes the line curved
        fill: true,
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Prescriptions', 'OTC', 'Vitamins', 'Personal Care'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [300, 150, 100, 50],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } }
  };

  // --- Table Data (Placeholder) ---
  const recentOrders = [
    { id: 'ORD-001', customer: 'Ahmed Helmy', date: '2025-10-27', amount: 75.50, status: 'Completed' },
    { id: 'ORD-002', customer: 'Yaseen Al Amawy', date: '2025-10-27', amount: 120.00, status: 'Pending' },
    { id: 'ORD-003', customer: 'Omar Hamad', date: '2025-10-26', amount: 45.25, status: 'Completed' },
    { id: 'ORD-004', customer: 'Yousef Ahmed', date: '2025-10-25', amount: 210.00, status: 'Shipped' },
    { id: 'ORD-005', customer: 'Hassan Mohamed', date: '2025-10-24', amount: 88.75, status: 'Cancelled' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const NavLink: React.FC<{ to: string; icon: React.ReactElement; children: React.ReactNode; }> = ({ to, icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center p-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200 ${isActive ? 'bg-slate-900 text-white' : ''} ${!isSidebarOpen && 'justify-center'}`}>
        {React.cloneElement(icon, { className: `text-lg ${isSidebarOpen ? 'mr-4' : ''}` })}
        {isSidebarOpen && <span className="font-medium">{children}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`bg-slate-800 text-white shadow-lg flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-24'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 h-20">
          {isSidebarOpen && (
            <div className="flex items-center">
              {pharmacyInfo?.logoImage ? (
                <img src={pharmacyInfo.logoImage} alt="Logo" className="w-10 h-10 rounded-full mr-3 object-cover" />
              ) : (
                <div className="w-10 h-10 bg-green-500 rounded-full mr-3 flex items-center justify-center font-bold">P</div>
              )}
              <h2 className="text-xl font-bold">{getAbbreviatedName(pharmacyInfo?.name)}</h2>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-slate-700 focus:outline-none">
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-2 flex flex-col">
            <NavLink to="/dashboard/pharmacy" icon={<FaTachometerAlt />}>Dashboard</NavLink>
            <NavLink to="/dashboard/pharmacy/products" icon={<FaBox />}>Products</NavLink>
            <NavLink to="/dashboard/pharmacy/new-product" icon={<FaPlusCircle />}>Add Product</NavLink>
            {/* Link to Pharmacy Profile Page, passing the current user's UID as the ID */}
            <NavLink to={`/profile/pharmacy/${user.uid}`} icon={<FaUserAlt />}>Profile</NavLink>
            <NavLink to="/account" icon={<FaUserAlt />}>Account</NavLink>
            
            {/* Spacer to push sign out to the bottom */}

            {/* Correct, functional Sign Out button */}
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className={`flex items-center p-3 w-full text-left text-red-400 hover:bg-red-700 hover:text-white rounded-lg transition-colors duration-200 ${!isSidebarOpen && 'justify-center'}`}
            >
              <FaSignOutAlt className={`text-lg ${isSidebarOpen ? 'mr-4' : ''}`} />
              {isSidebarOpen && <span className="font-medium">Sign Out</span>}
            </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
                <span className="text-slate-600 font-medium hidden sm:block">{userData.fullName || userData.username || 'User'}</span>
                {(userData.photoDataUrl || user.photoURL) ? (
                    <img src={userData.photoDataUrl || user.photoURL || ''} alt="User" className="w-10 h-10 rounded-full object-cover" />
                 ) : (
                    <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 font-semibold">
                        {userData.fullName ? userData.fullName.charAt(0) : user.email?.charAt(0) || 'U'}
                    </div>
                 )}
            </div>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Sales Today</p>
              <p className="text-3xl font-bold text-slate-800">EGP 1,280</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full"><FaCoins className="text-green-500 text-2xl"/></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Orders</p>
              <p className="text-3xl font-bold text-slate-800">50</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full"><FaChartBar className="text-blue-500 text-2xl"/></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
             <div>
              <p className="text-sm font-medium text-gray-500">Refunds</p>
              <p className="text-3xl font-bold text-slate-800">4</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full"><FaRedo className="text-pink-500 text-2xl"/></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">New Customers</p>
              <p className="text-3xl font-bold text-slate-800">+12</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full"><FaUsers className="text-purple-500 text-2xl"/></div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Weekly Sales Trend</h3>
            <div className="h-80 relative"><Line options={chartOptions} data={lineChartData} /></div>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Sales by Category</h3>
            <div className="h-80 relative"><Doughnut options={chartOptions} data={doughnutChartData} /></div>
          </div>
        </div>

        {/* Recent Orders Table */}
         <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Orders</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 text-sm text-slate-500">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3 font-medium text-slate-700">{order.id}</td>
                                <td className="p-3 text-slate-600">{order.customer}</td>
                                <td className="p-3 text-slate-600">{order.date}</td>
                                <td className="p-3 text-right text-slate-600">EGP {order.amount.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      {/* Sign Out Confirmation Pop-up */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
            <p className="text-lg font-semibold mb-4 text-slate-800">Are you sure you want to sign out?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSignOut}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
              >
                Agree
              </button>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-6 py-2 bg-gray-200 text-slate-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
