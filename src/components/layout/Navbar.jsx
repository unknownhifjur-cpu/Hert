import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-rose-600 hover:text-rose-700 transition" onClick={closeMenu}>
            HeartLock
          </Link>

          {/* Desktop Navigation (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-rose-600 transition font-medium">
                  Home
                </Link>
                <Link to="/upload" className="text-gray-700 hover:text-rose-600 transition font-medium">
                  Upload
                </Link>
                <Link to={`/profile/${user.username}`} className="text-gray-700 hover:text-rose-600 transition font-medium">
                  Profile
                </Link>
                <span className="text-gray-600 text-sm">Welcome, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-rose-600 transition font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-rose-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu (dropdown) */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-2 border-t border-gray-100 pt-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-rose-600 transition font-medium py-2"
                  onClick={closeMenu}
                >
                  Home
                </Link>
                <Link
                  to="/upload"
                  className="block text-gray-700 hover:text-rose-600 transition font-medium py-2"
                  onClick={closeMenu}
                >
                  Upload
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className="block text-gray-700 hover:text-rose-600 transition font-medium py-2"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <div className="py-2 text-gray-600 text-sm">Welcome, {user.username}!</div>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full text-left bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-700 hover:text-rose-600 transition font-medium py-2"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;