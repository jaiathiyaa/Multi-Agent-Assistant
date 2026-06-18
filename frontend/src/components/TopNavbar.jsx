import React from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';
import { LogOut, Bot, User } from 'lucide-react';

const TopNavbar = () => {
  const navigate = useNavigate();
  const user = storage.getUser();
  const email = user?.email || 'user@documentai.com';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-600/20">
          <Bot className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          DocumentAI
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-850 px-3 py-1.5 rounded-full border border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-slate-300 font-medium hidden sm:inline">
            {email}
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/20 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
