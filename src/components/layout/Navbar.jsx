import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, Upload, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check if a path is active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Main navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-rose-600 hover:text-rose-700 transition">
              HeartLock
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className={`transition font-medium ${
                  isActive('/')
                    ? 'text-rose-600'
                    : 'text-gray-700 hover:text-rose-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/upload"
                className={`transition font-medium ${
                  isActive('/upload')
                    ? 'text-rose-600'
                    : 'text-gray-700 hover:text-rose-600'
                }`}
              >
                Upload
              </Link>
              <Link
                to={`/profile/${user.username}`}
                className={`transition font-medium ${
                  isActive(`/profile/${user.username}`)
                    ? 'text-rose-600'
                    : 'text-gray-700 hover:text-rose-600'
                }`}
              >
                Profile
              </Link>
              <span className="text-gray-600 text-sm">Welcome, {user.username}!</span>
              <button
                onClick={handleLogout}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile placeholder */}
            <div className="md:hidden"></div>
          </div>
        </div>
      </nav>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            className={`flex flex-col items-center p-2 transition active:scale-95 ${
              isActive('/') ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/upload"
            className={`flex flex-col items-center p-2 transition active:scale-95 ${
              isActive('/upload') ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'
            }`}
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs mt-1">Upload</span>
          </Link>
          <Link
            to={`/profile/${user.username}`}
            className={`flex flex-col items-center p-2 transition active:scale-95 ${
              isActive(`/profile/${user.username}`) ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition active:scale-95"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-0"></div>
    </>
  );
};

export default Navbar;