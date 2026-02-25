import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex gap-6 items-center">
      <Link to="/" className="hover:text-gray-300">Home</Link>
      {user ? (
        <>
          <Link to="/upload" className="hover:text-gray-300">Upload</Link>
          <Link to={`/profile/${user.username}`} className="hover:text-gray-300">Profile</Link>
          <button onClick={handleLogout} className="ml-auto bg-red-500 px-3 py-1 rounded hover:bg-red-600">
            Logout
          </button>
          <span>Welcome, {user.username}!</span>
        </>
      ) : (
        <>
          <Link to="/login" className="hover:text-gray-300">Login</Link>
          <Link to="/register" className="hover:text-gray-300">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;