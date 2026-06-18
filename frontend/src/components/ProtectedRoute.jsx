import React from 'react';
import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';

const ProtectedRoute = ({ children }) => {
  const isAuth = storage.isAuthenticated();
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
