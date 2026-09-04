import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, CreditCard, Phone, MessageCircle, Award } from 'lucide-react';
import './BottomNavbar.css';

export default function BottomNavbar() {
  const location = useLocation();

  const navItems = [
    { icon: <Home size={22} />, label: 'Home', path: '/' },
    { icon: <FileText size={22} />, label: 'Documents', path: '/documents' },
    { icon: <Award size={22} />, label: 'Catalog', href: 'https://www.avanifinserv.com/catlog.html', external: true },
    { icon: <CreditCard size={22} />, label: 'CIBIL', path: '/cibil-check' },
    { icon: <Phone size={22} />, label: 'Contact', path: '/contact' },
    {
      icon: <MessageCircle size={22} />, 
      label: 'WhatsApp',
      href: 'https://wa.me/919175635165?text=Hello%2C%20I%20need%20help%20with%20a%20loan',
      external: true,
    },
  ];

  return (
    <nav className="bottom-navbar" id="bottom-navbar" aria-label="Bottom Navigation">
      {navItems.map((item, i) => {
        if (item.href) {
          return (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`bottom-nav-item bottom-nav-whatsapp`}
              aria-label={item.label}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </a>
          );
        }
        return (
          <Link
            key={i}
            to={item.path}
            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            aria-label={item.label}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
