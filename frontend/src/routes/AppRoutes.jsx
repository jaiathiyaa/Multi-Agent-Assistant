import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GetStarted from '../pages/GetStarted';
import Signup from '../pages/Signup';
import Login from '../pages/Login';
import Chat from '../pages/Chat';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GetStarted />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
