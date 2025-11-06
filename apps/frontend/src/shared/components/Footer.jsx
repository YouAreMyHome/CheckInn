/**
 * Footer Component - Shared across all pages
 * 
 * Features:
 * - Brand logo and tagline
 * - 4-column layout: Company, Partners, Support, Legal
 * - Partner application status link (highlighted)
 * - Copyright notice
 * - Responsive grid layout
 * 
 * @author CheckInn Team
 * @version 1.0.0
 */

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CheckInn</span>
            </div>
            <p className="text-gray-600 text-sm">
              Find and book the perfect hotel for your next adventure.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Press
                </a>
              </li>
            </ul>
          </div>

          {/* Partners Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Partners</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/partner/register" className="hover:text-gray-900">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link
                  to="/partner/application-status"
                  className="hover:text-gray-900 font-medium text-blue-600"
                >
                  Check Application Status
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Partner Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <p className="text-center text-sm text-gray-600">
            © 2025 CheckInn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
