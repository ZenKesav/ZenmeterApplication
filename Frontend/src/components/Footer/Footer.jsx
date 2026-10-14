import React from 'react';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-white border-top text-center text-muted small">
      <div className="container-fluid">
        <span>&copy; {new Date().getFullYear()} Zenmeter - Redefining Metering Possibilities. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
