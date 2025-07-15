import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordLink = () => {
  return (
    <div className="text-center">
      <Link
        to="/password-reset-screen"
        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
      >
        Forgot your password?
      </Link>
    </div>
  );
};

export default ForgotPasswordLink;