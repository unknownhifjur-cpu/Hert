import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-rose-600">HeartLock</h1>
        </div>

        {/* Login / Register Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <div className="flex-1 text-center pb-3 text-rose-600 font-semibold border-b-2 border-rose-600">
            Login
          </div>
          <Link
            to="/register"
            className="flex-1 text-center pb-3 text-gray-500 font-semibold hover:text-rose-600 transition"
          >
            Register
          </Link>
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 text-sm mb-6">Log in to continue to HeartLock</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field with Icon */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password Field with Icon */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button with Icon & Hover/Active Effects */}
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            <span>Log In</span>
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-rose-500 hover:text-rose-600 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;