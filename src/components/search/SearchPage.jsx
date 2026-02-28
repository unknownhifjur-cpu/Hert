import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, User, Image } from 'lucide-react';
import api from '../../utils/api';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'photos'
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  // Get query from URL on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
    inputRef.current?.focus();
  }, [location.search]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      // Fetch users (existing endpoint)
      const usersRes = await api.get(`/users/search?q=${searchQuery}`);
      setUsers(usersRes.data);

      // Optional: fetch photos if you have an endpoint
      // const photosRes = await api.get(`/photos/search?q=${searchQuery}`);
      // setPhotos(photosRes.data);

      // Update URL
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setUsers([]);
    setPhotos([]);
    navigate('/search', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!query.trim()}
              className="px-6 py-3 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500"></div>
            <p className="mt-2 text-gray-400">Searching...</p>
          </div>
        ) : (
          <>
            {users.length > 0 || photos.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs (only if both user and photo search are available) */}
                {photos.length > 0 && (
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`flex-1 py-3 font-medium text-sm transition ${
                        activeTab === 'users'
                          ? 'text-rose-600 border-b-2 border-rose-500'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Users ({users.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('photos')}
                      className={`flex-1 py-3 font-medium text-sm transition ${
                        activeTab === 'photos'
                          ? 'text-rose-600 border-b-2 border-rose-500'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Photos ({photos.length})
                    </button>
                  </div>
                )}

                <div className="p-4">
                  {activeTab === 'users' && (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => navigate(`/profile/${user.username}`)}
                          className="flex items-center space-x-3 p-3 hover:bg-rose-50 rounded-xl cursor-pointer transition"
                        >
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.username}</p>
                            {user.fullName && (
                              <p className="text-sm text-gray-400">{user.fullName}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'photos' && (
                    <div className="grid grid-cols-3 gap-1">
                      {photos.map((photo) => (
                        <div
                          key={photo._id}
                          onClick={() => navigate(`/photo/${photo._id}`)}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                        >
                          <img
                            src={photo.imageUrl || '/placeholder.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              query && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400">No results for "{query}"</p>
                  <p className="text-sm text-gray-300 mt-1">Try a different search term</p>
                </div>
              )
            )}
          </>
        )}

        {/* Initial state (no query) */}
        {!query && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Search for users</p>
            <p className="text-sm text-gray-300 mt-1">Enter a username to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;