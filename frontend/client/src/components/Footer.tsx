import React, { useState, useCallback, memo } from 'react';
import { Link } from 'wouter';
import { 
  FaEnvelope, FaPhone, FaShieldAlt, FaTwitter, FaLinkedin, FaFacebook
} from 'react-icons/fa';

// Memoized contact info component for better performance
const ContactInfo = memo(({ 
  icon, 
  text, 
  isCopied, 
  onCopy 
}: { 
  icon: React.ReactNode, 
  text: string, 
  isCopied: boolean, 
  onCopy: () => void 
}) => (
  <div 
    className="text-light contact-info-item px-2 py-1 rounded transition-all hover-shadow cursor-pointer"
    onClick={onCopy}
    title={`Click to copy ${text}`}
  >
    <div className="d-flex align-items-center">
      {icon}
      <span className="small ms-1">{text}</span>
      {isCopied && <div className="copy-tooltip">Copied!</div>}
    </div>
  </div>
));

// Memoized social icon component
const SocialIcon = memo(({ 
  icon, 
  href = "#" 
}: { 
  icon: React.ReactNode, 
  href?: string 
}) => (
  <a 
    href={href} 
    className="text-white social-icon-sm transition-all hover-opacity-75"
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
  </a>
));

// Optimized footer component
const Footer: React.FC = () => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  // Memoized event handlers
  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText('support@tunnelguard.gov.bh');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  }, []);

  const handleCopyPhone = useCallback(() => {
    navigator.clipboard.writeText('+973 1711 2345');
    setPhoneCopied(true);
    setTimeout(() => setPhoneCopied(false), 2000);
  }, []);

  // Constants
  const currentYear = new Date().getFullYear();
  const email = 'support@tunnelguard.gov.bh';
  const phone = '+973 1711 2345';

  // Quick links configuration for easier maintenance
  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/tunnels", label: "Tunnels" },
    { path: "/alerts", label: "Alerts" }
  ];

  // Social media configuration
  const socialLinks = [
    { icon: <FaTwitter size={14} />, href: "#twitter" },
    { icon: <FaFacebook size={14} />, href: "#facebook" },
    { icon: <FaLinkedin size={14} />, href: "#linkedin" }
  ];

  return (
    <footer className="mt-auto">
      {/* Main footer with gradient background */}
      <div className="py-3" style={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="container">
          <div className="row g-3 align-items-center">
            {/* Company Logo & Info */}
            <div className="col-lg-3 col-md-3">
              <div className="d-flex align-items-center">
                <FaShieldAlt className="text-white me-2" size={22} />
                <h5 className="text-white m-0 fw-bold">TunnelGuard</h5>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-5 col-md-5">
              <div className="d-flex gap-3 justify-content-center">
                {quickLinks.map(link => (
                  <Link 
                    key={link.path} 
                    href={link.path} 
                    className="text-light hover-link transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Buttons & Social */}
            <div className="col-lg-4 col-md-4">
              <div className="d-flex gap-2 justify-content-end align-items-center">
                {/* Contact Info */}
                <ContactInfo 
                  icon={<FaEnvelope size={12} />} 
                  text={email} 
                  isCopied={emailCopied} 
                  onCopy={handleCopyEmail} 
                />
                <ContactInfo 
                  icon={<FaPhone size={12} />} 
                  text={phone} 
                  isCopied={phoneCopied} 
                  onCopy={handleCopyPhone} 
                />
                
                {/* Social Icons */}
                <div className="d-flex gap-2 ms-2">
                  {socialLinks.map((social, index) => (
                    <SocialIcon 
                      key={index} 
                      icon={social.icon} 
                      href={social.href} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Copyright */}
      <div className="py-2" style={{ background: '#193366' }}>
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <p className="mb-0 text-light small">&copy; {currentYear} TunnelGuard. All rights reserved.</p>
            <p className="mb-0 text-light small">Made with <span className="text-danger">❤</span> for safety</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);