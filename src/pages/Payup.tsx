import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types'; // Assuming Product type is available

// --- Using react-icons for a polished look ---
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiCopy,
  FiCheckCircle,
  FiShoppingCart,
  FiSmartphone,
} from 'react-icons/fi';

const Payup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  const productToBuy: Product | undefined = location.state?.productToBuy; // Get product from state

  // Destructure clearCart from useCart
  const { items, getTotalPrice, clearCart } = useCart();
  // Removed unused 'user' variable
  const { userData } = useAuth();

  const [name, setName] = useState(userData?.fullName || '');
  const [phone, setPhone] = useState(userData?.phoneNumber || '');
  const [address, setAddress] = useState(''); // Do not pre-fill address
  const [vodafoneCashNumber, setVodafoneCashNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Update state if userData changes (e.g., after login)
  useEffect(() => {
    if (userData) {
      setName(userData.fullName || '');
      setPhone(userData.phoneNumber || '');
      // Address is manually entered, so do not pre-fill from userData
    }
  }, [userData]);

  // The Vodafone Cash number for your business, loaded from .env
  const RECIPIENT_VODAFONE_CASH_NUMBER = import.meta.env.VITE_VODAFONE_CASH_NUMBER || '01030670504';

  const handleCopy = () => {
    navigator.clipboard.writeText(RECIPIENT_VODAFONE_CASH_NUMBER);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to a backend for verification.
    // The alert is a placeholder for this logic.
    console.log({
      name,
      phone,
      address,
      paymentMethod: 'Vodafone Cash',
      senderVodafoneCash: vodafoneCashNumber,
      transactionId,
      total: calculateTotalWithExtras(), // Use the total with shipping and tax
      items: productToBuy ? [productToBuy] : items, // Log either the single product or cart items
    });

    alert('Order successfully placed! You will be redirected.');

    // Clear the cart only if the order was placed from the cart, not direct buy
    if (!productToBuy) {
      clearCart(); 
    }

    navigate('/order-confirmation');
  };

  // **FIXED**: Simplified the form invalidation check. The required attribute on inputs handles individual fields.
  // The primary check is to ensure the cart is not empty.
  const SHIPPING_COST = 10.00; // Fixed shipping cost
  const TAX_AMOUNT = 5.00;    // Fixed tax amount

  const calculateTotalWithExtras = () => {
    const subtotal = productToBuy ? productToBuy.price : getTotalPrice();
    return subtotal + SHIPPING_COST + TAX_AMOUNT;
  };

  const isFormInvalid = productToBuy ? false : items.length === 0; // Form is invalid if no product and cart is empty

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 text-center mb-10">
          Payment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-12">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200/80 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-5">
              <FiShoppingCart className="text-indigo-500" />
              Order Summary
            </h2>
            {productToBuy ? (
              <>
                <div className="flex-grow space-y-4 overflow-y-auto max-h-[20rem] pr-2 -mr-2">
                  <div key={productToBuy.id} className="flex items-center space-x-4">
                    <img
                      src={productToBuy.image || '/placeholder-product.jpg'}
                      alt={productToBuy.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{productToBuy.name}</p>
                      <p className="text-sm text-gray-500">Qty: 1</p> {/* Assuming 1 quantity for direct buy */}
                    </div>
                    <p className="font-semibold text-gray-900">
                      {productToBuy.price.toFixed(2)} EGP
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{productToBuy.price.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{SHIPPING_COST.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{TAX_AMOUNT.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{calculateTotalWithExtras().toFixed(2)} EGP</span>
                  </div>
                </div>
              </>
            ) : items.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 py-10">
                 <FiShoppingCart size={40} className="mb-4 text-gray-400" />
                 <p className="font-medium">Your cart is empty.</p>
                 <p className="text-sm">Add products to your cart to proceed.</p>
              </div>
            ) : (
              <>
                <div className="flex-grow space-y-4 overflow-y-auto max-h-[20rem] pr-2 -mr-2">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <img
                        src={product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {(product.price * quantity).toFixed(2)} EGP
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{getTotalPrice().toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{SHIPPING_COST.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{TAX_AMOUNT.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{calculateTotalWithExtras().toFixed(2)} EGP</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Checkout Form */}
          <div className="lg:col-span-3 mt-10 lg:mt-0">
            {/* The `required` attribute on inputs provides browser validation before submission. */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200/80">
                <h2 className="text-xl font-semibold text-gray-800 mb-5">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" required />
                  </div>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyPress={(event) => {
                        if (!/[0-9]/.test(event.key)) {
                          event.preventDefault();
                        }
                      }}
                      placeholder="Phone Number (e.g., 01xxxxxxxxx)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      maxLength={11}
                      required
                    />
                  </div>
                  <div className="relative">
                     <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      id="address"
                      rows={3}
                      value={address}
                      onChange={e => {
                        // Allow only Arabic characters, numbers, and common punctuation/spaces
                        const arabicRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\d\.,\-\(\)]*$/;
                        if (arabicRegex.test(e.target.value) || e.target.value === '') {
                          setAddress(e.target.value);
                        }
                      }}
                      placeholder="أدخل عنوانك داخل ابوحمص فقط باللغة العربية"// Arabic placeholder
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                      dir="rtl" // Set text direction to right-to-left
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200/80">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3 mb-5">
                    <FiCreditCard className="text-indigo-500" />
                    Payment Method
                </h2>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-indigo-900">
                  <div className="flex items-center gap-3">
                    <FiSmartphone size={20} />
                    <p className="font-semibold">Vodafone Cash (EGP Only)</p>
                  </div>
                  <p className="text-sm mt-3">
                    Please transfer a total of <span className="font-bold">{calculateTotalWithExtras().toFixed(2)} EGP</span> to this number:
                  </p>
                  <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-md p-3 mt-2">
                    <span className="text-lg font-mono tracking-wider text-indigo-900">{RECIPIENT_VODAFONE_CASH_NUMBER}</span>
                    <button type="button" onClick={handleCopy} className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                      {isCopied ? <FiCheckCircle className="text-green-500"/> : <FiCopy />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs mt-4">After payment, fill in your details below to confirm your order.</p>

                  <div className="mt-4 space-y-4">
                     <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          id="vodafoneCashNumber"
                          value={vodafoneCashNumber}
                          onChange={e => setVodafoneCashNumber(e.target.value)}
                          onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                          placeholder="Your Vodafone Cash Number"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          maxLength={11}
                          required
                        />
                     </div>
                     <input type="text" id="transactionId" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Transaction ID (Optional)" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isFormInvalid}
                className="w-full bg-indigo-600 text-white font-bold text-lg py-4 px-6 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payup;
