import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Keep useLocation for inner component
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// New component to wrap content inside Router
const AppContent: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation(); // useLocation is now inside Router context
  const hideHeader = location.pathname === '/login';

  return (
    <LanguageProvider>
      <AuthProvider> {/* AuthProvider now wraps CartProvider */}
        <CartProvider>
          <div className="min-h-screen bg-white">
            {!hideHeader && <Header />}
            <main>
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> {/* New route */}
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} /> {/* New route */}
                  <Route path="/number" element={<NumberInputPage />} /> {/* New route */}
                  <Route path="/role" element={<RoleSelectionPage />} /> {/* New route */}
                  <Route path="/dashboard/delivery" element={<DeliveryDashboard />} /> {/* New route */}
                  <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} /> {/* New route */}
                  <Route path="/products" element={<ProductsPage />} /> {/* New route for products */}
                  <Route path="/product/:productId" element={<ProductDetailPage />} /> {/* Route for product detail page */}
                  <Route path="/payup" element={<Payup />} /> {/* New route for Payup page */}
                  <Route path="/obp" element={<OrderPrescriptionPage />} /> {/* New route for Order by Prescription page */}
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
