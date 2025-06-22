import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Heart size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-white">PharmaGo</h3>
                <p className="text-sm text-gray-400 mt-1">Healthcare Delivered, Simplified.</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your trusted online pharmacy delivering authentic medicines and health products
              with professional medical consultation.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Facebook size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Twitter size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Instagram size={22} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Youtube size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-gray-400 hover:text-white transition-colors duration-300">Home</a></li>
              <li><a href="/medications" className="text-gray-400 hover:text-white transition-colors duration-300">Medications</a></li>
              <li><a href="/skincare" className="text-gray-400 hover:text-white transition-colors duration-300">Skin Care</a></li>
              <li><a href="/vitamins" className="text-gray-400 hover:text-white transition-colors duration-300">Vitamins</a></li>
              <li><a href="/baby-care" className="text-gray-400 hover:text-white transition-colors duration-300">Baby Care</a></li>
              <li><a href="/pet-care" className="text-gray-400 hover:text-white transition-colors duration-300">Pet Care</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">90-Min Express Delivery</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">AI Doctor Consultation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Prescription Upload</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Medicine Reminders</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Health Checkups</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Lab Tests</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-400" />
                <span className="text-gray-400">+20 122 791 9119</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-400" />
                <span className="text-gray-400">pharmago.help@gmail.com</span>
              </div>
            </div>

            <div className="mt-8">
              <h5 className="font-semibold mb-3 text-white">Download Our App</h5>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors duration-300 shadow-md">
                  App Store
                </button>
                <button className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-base font-medium hover:bg-green-700 transition-colors duration-300 shadow-md">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} PharmaGo. All rights reserved.
            </div> 
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <a href="/privacy-policy" className="text-gray-500 hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="/terms-of-service" className="text-gray-500 hover:text-white transition-colors duration-300">Terms of Service</a>
              <a href="/center" className="text-gray-500 hover:text-white transition-colors duration-300">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
