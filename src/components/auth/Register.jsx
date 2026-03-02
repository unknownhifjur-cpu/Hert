import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });

  // Function to calculate password strength
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    // Criteria
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    // Map score to label and color
    let label = '';
    let color = '';
    if (score <= 2) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 4) {
      label = 'Medium';
      color = 'bg-yellow-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    setPasswordStrength({ score, label, color });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    calculateStrength(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(username, email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo (text only) */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-rose-600">HeartLock</h1>
        </div>

        {/* Login / Register Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link
            to="/login"
            className="flex-1 text-center pb-3 text-gray-500 font-semibold hover:text-rose-600 transition"
          >
            Login
          </Link>
          <div className="flex-1 text-center pb-3 text-rose-600 font-semibold border-b-2 border-rose-600">
            Register
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
        <p className="text-gray-500 text-sm mb-6">Sign up to start using HeartLock</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field with Icon */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                placeholder="hifjur_user"
              />
            </div>
          </div>

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

          {/* Password Field with Icon and Strength Meter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition"
                placeholder="••••••••"
              />
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    Password strength:
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      passwordStrength.label === 'Weak'
                        ? 'text-red-600'
                        : passwordStrength.label === 'Medium'
                        ? 'text-yellow-600'
                        : passwordStrength.label === 'Strong'
                        ? 'text-green-600'
                        : ''
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Use at least 8 characters, uppercase, lowercase, number, and symbol.
                </p>
              </div>
            )}
          </div>

          {/* Submit Button with Icon & Hover/Active Effects */}
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-sm hover:shadow-md flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5" />
            <span>Register</span>
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-500 hover:text-rose-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;