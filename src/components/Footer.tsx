import React from 'react';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-dark-blue to-medium-blue p-2 rounded-lg">
                <Heart size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">PharmaGo</h3>
                <p className="text-xs text-gray-400">Healthcare Delivered</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted online pharmacy delivering authentic medicines and health products
              with professional medical consultation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-light-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-light-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-light-blue transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-light-blue transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-light-blue">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="/medications" className="text-gray-300 hover:text-white transition-colors">Medications</a></li>
              <li><a href="/skincare" className="text-gray-300 hover:text-white transition-colors">Skin Care</a></li>
              <li><a href="/vitamins" className="text-gray-300 hover:text-white transition-colors">Vitamins</a></li>
              <li><a href="/baby-care" className="text-gray-300 hover:text-white transition-colors">Baby Care</a></li>
              <li><a href="/pet-care" className="text-gray-300 hover:text-white transition-colors">Pet Care</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-light-blue">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">90-Min Express Delivery</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">AI Doctor Consultation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Prescription Upload</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Medicine Reminders</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Health Checkups</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Lab Tests</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-light-blue">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-medium-blue" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-medium-blue" />
                <span className="text-gray-300">support@PharmaGo.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-medium-blue" />
                <span className="text-gray-300">123 Healthcare St, Medical City</span>
              </div>
            </div>

            <div className="mt-6">
              <h5 className="font-semibold mb-2 text-light-blue">Download Our App</h5>
              <div className="flex space-x-2">
                <button className="bg-dark-blue text-white px-3 py-2 rounded text-sm hover:bg-medium-blue transition-colors">
                  App Store
                </button>
                <button className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 PharmaGo. All rights reserved. Licensed Pharmacy License #12345
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a> {/* Updated href */}
              <a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a> {/* Updated href */}
              {/* Removed Return Policy link */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
