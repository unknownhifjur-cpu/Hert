import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, Upload, User, LogOut, Search, X } from 'lucide-react';
import api from '../../utils/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
    clearSearch();
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

            {/* Search bar - hidden on mobile, shown on md+ */}
            <div className="hidden md:block flex-1 max-w-md mx-4" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
                {/* Search dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                    {searching ? (
                      <div className="p-4 text-center text-gray-400">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result._id}
                          onClick={() => goToProfile(result.username)}
                          className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-rose-50 transition"
                        >
                          <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                            {result.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-700">{result.username}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">No users found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
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
            </div>

            {/* Mobile placeholder */}
            <div className="md:hidden"></div>
          </div>

          {/* Mobile search bar (below logo on mobile) */}
          <div className="md:hidden mt-3 relative" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:ring-1 focus:ring-rose-200 focus:border-rose-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            {/* Mobile search dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {searching ? (
                  <div className="p-4 text-center text-gray-400">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result._id}
                      onClick={() => goToProfile(result.username)}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-rose-50 transition"
                    >
                      <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                        {result.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{result.username}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">No users found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          <Link to="/" className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition active:scale-95">
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/upload" className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition active:scale-95">
            <Upload className="w-6 h-6" />
            <span className="text-xs mt-1">Upload</span>
          </Link>
          <Link to={`/profile/${user.username}`} className="flex flex-col items-center p-2 text-gray-600 hover:text-rose-600 transition active:scale-95">
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