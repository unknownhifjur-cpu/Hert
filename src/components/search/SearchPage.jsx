import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import api from '../../utils/api';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

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
      const usersRes = await api.get(`/users/search?q=${searchQuery}`);
      setUsers(usersRes.data);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) performSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setUsers([]);
    setPhotos([]);
    navigate('/search', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Search Box */}
        <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-md border border-gray-100 p-5 mb-8">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-12 pr-10 py-3 rounded-full text-sm border border-gray-200 
                           focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400
                           transition-all duration-300 bg-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition" />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!query.trim()}
              className="px-7 py-3 rounded-full text-sm font-semibold text-white 
                         bg-gradient-to-r from-rose-500 to-pink-500
                         hover:opacity-90 transition-all duration-300
                         shadow-md hover:shadow-lg active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-gray-100 p-14 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-200 border-t-rose-500"></div>
            <p className="mt-4 text-gray-400 font-medium">Searching...</p>
          </div>
        )}

        {/* Results */}
        {!loading && (users.length > 0 || photos.length > 0) && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

            {photos.length > 0 && (
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 py-4 text-sm font-semibold transition ${
                    activeTab === 'users'
                      ? 'text-rose-600 border-b-2 border-rose-500 bg-rose-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Users ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`flex-1 py-4 text-sm font-semibold transition ${
                    activeTab === 'photos'
                      ? 'text-rose-600 border-b-2 border-rose-500 bg-rose-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Photos ({photos.length})
                </button>
              </div>
            )}

            <div className="p-5">

              {activeTab === 'users' && (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/profile/${user.username}`)}
                      className="flex items-center space-x-4 p-4 rounded-2xl cursor-pointer
                                 hover:bg-rose-50 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 
                                      flex items-center justify-center text-white font-semibold shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.username}
                        </p>
                        {user.fullName && (
                          <p className="text-sm text-gray-400">
                            {user.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo._id}
                      onClick={() => navigate(`/photo/${photo._id}`)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer 
                                 hover:scale-[1.02] hover:shadow-md transition-all duration-300"
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
        )}

        {/* No Results */}
        {!loading && query && users.length === 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-gray-100 p-16 text-center">
            <Search className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No results for "{query}"
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try a different search term
            </p>
          </div>
        )}

        {/* Initial State */}
        {!query && !loading && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-gray-100 p-16 text-center">
            <Search className="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              Search for users
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Enter a username to get started
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchPage;