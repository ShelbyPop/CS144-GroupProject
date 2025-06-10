import React, { useEffect, useState } from 'react';
import './CookieBanner.css';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p>
        This site uses cookies to enhance user experience and for authentication purposes.
        By continuing, you agree to our use of cookies.{' '}
      </p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
}
