import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-bosch-navy text-white" data-testid="main-footer">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold font-heading mb-4">BOSCH</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Premium kitchen appliances engineered with German precision for modern living.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="hover:text-bosch-red transition-colors" data-testid="facebook-link">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-bosch-red transition-colors" data-testid="twitter-link">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-bosch-red transition-colors" data-testid="instagram-link">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-bosch-red transition-colors" data-testid="linkedin-link">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-products-link">Products</Link></li>
              <li><Link to="/about" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-about-link">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-contact-link">Contact</Link></li>
              <li><Link to="/warranty" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-warranty-link">Warranty</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=ovens" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-ovens-link">Built-in Ovens</Link></li>
              <li><Link to="/products?category=cooktops" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-cooktops-link">Cooktops & Hobs</Link></li>
              <li><Link to="/products?category=dishwashers" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-dishwashers-link">Dishwashers</Link></li>
              <li><Link to="/products?category=chimneys" className="text-slate-300 hover:text-bosch-red transition-colors" data-testid="footer-chimneys-link">Kitchen Chimneys</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 text-bosch-red" />
                <span className="text-slate-300">123 Business Park, Mumbai, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-bosch-red" />
                <span className="text-slate-300">+91 1800 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-bosch-red" />
                <span className="text-slate-300">support@bosch.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2026 Bosch Appliances. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;