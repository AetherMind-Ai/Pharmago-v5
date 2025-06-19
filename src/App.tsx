import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Keep useLocation for inner component
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'; // Added import
import TermsOfServicePage from './pages/TermsOfServicePage'; // Added import
import NumberInputPage from './pages/NumberInputPage'; // Added import
import RoleSelectionPage from './pages/RoleSelectionPage'; // Added import
import DeliveryDashboard from './pages/DeliveryDashboard'; // Added import
import PharmacyDashboard from './pages/PharmacyDashboard'; // Added import
import ProductsPage from './pages/ProductsPage'; // Added import for ProductsPage
import Payup from './pages/Payup'; // Import Payup
import ProductDetailPage from './pages/ProductDetailPage'; // Import ProductDetailPage
import OrderPrescriptionPage from './pages/OrderPrescriptionPage'; // Import OrderPrescriptionPage
import VerifyPharmacyPage from './pages/VerifyPharmacyPage'; // Import VerifyPharmacyPage
import PharmacyInfoPage from './pages/PharmacyInfoPage'; // Import PharmacyInfoPage
import AddProductPage from './pages/AddProductPage'; // Import AddProductPage
import PharmacyProductsPage from './pages/PharmacyProductsPage.tsx'; // Import PharmacyProductsPage
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate } from 'react-router-dom'; // Import Navigate
import { toast } from 'react-toastify'; // Import toast

// Protected Route Component
const ProtectedRoute: React.FC<{ element: React.ReactElement; requiredRole?: string }> = ({ element, requiredRole }) => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    // Optionally render a loading spinner or null while checking auth
    return null;
  }

  if (!user) {
    // Redirect to login if not authenticated
    toast.info('You need to be logged in to access this page.');
    return <Navigate to="/login" replace />;
  }

  // If a required role is specified, check user data and role
  if (requiredRole) {
    if (!userData || userData.role !== requiredRole) {
      // Redirect if user data is not loaded or role doesn't match
      toast.error(`Access denied. You must have the '${requiredRole}' role to view this page.`);
      return <Navigate to="/" replace />; // Redirect to home or an unauthorized page
    }
  }

  return element; // Render the protected element if authenticated and role matches (if required)
};

// New component to wrap content inside Router
const AppContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation(); // useLocation is now inside Router context
  const hideHeader = location.pathname === '/login';

  return (
    <LanguageProvider>
      <AuthProvider> {/* AuthProvider now wraps CartProvider */}
        <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            {!hideHeader && <Header />}
            <main className="flex-grow">
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> {/* New route */}
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} /> {/* New route */}
                  <Route path="/number" element={<NumberInputPage />} /> {/* New route */}
                  <Route path="/role" element={<RoleSelectionPage />} /> {/* New route */}
                  <Route path="/dashboard/delivery" element={<DeliveryDashboard />} /> {/* New route */}
                  {/* Protect the Pharmacy Dashboard route */}
                  <Route path="/dashboard/pharmacy" element={<ProtectedRoute element={<PharmacyDashboard />} requiredRole="pharmacy" />} />
                  <Route path="/products" element={<ProductsPage />} /> {/* New route for products */}
                  <Route path="/product/:productId" element={<ProductDetailPage />} /> {/* Route for product detail page */}
                  <Route path="/payup" element={<Payup />} /> {/* New route for Payup page */}
                  <Route path="/obp" element={<OrderPrescriptionPage />} /> {/* New route for Order by Prescription page */}
                  <Route path="/verify/pharmacy" element={<VerifyPharmacyPage />} /> {/* New route for Pharmacy Verification page */}
                  <Route path="/info/pharmacy" element={<PharmacyInfoPage />} /> {/* New route for Pharmacy Info page */}
                  {/* Protect Pharmacy related routes */}
                  <Route 
                    path="/dashboard/pharmacy/new-product" 
                    element={<ProtectedRoute element={<AddProductPage />} requiredRole="pharmacy" />} 
                  />
                   <Route 
                    path="/dashboard/pharmacy/products" 
                    element={<ProtectedRoute element={<PharmacyProductsPage />} requiredRole="pharmacy" />} 
                  />
                </Routes>
              </main>
              <Footer />
            <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
          <ToastContainer />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent /> {/* Render the new component inside Router */}
    </Router>
  );
}

export default App;
