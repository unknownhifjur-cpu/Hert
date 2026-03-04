import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Heart, HeartHandshake, Users, Send, Search, Check, X, Sparkles,
} from 'lucide-react';

/* ─── Shared motion variants (mirrors Navbar) ─── */
const iconVariants = {
  hover: { scale: 1.08, transition: { type: 'spring', stiffness: 400, damping: 10 } },
  tap:   { scale: 0.95 },
};
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ─── Avatar (rose gradient, mirrors Navbar badge bg-rose-500 tone) ─── */
const Avatar = ({ name, size = 'md' }) => {
  const sz = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-10 w-10 text-sm';
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-semibold text-white shadow-sm`}
      style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48)' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

/* ─── Card surface (white + rose-100 border — identical to Navbar nav surface) ─── */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-rose-100 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

/* ─── Status chip ─── */
const Chip = ({ children, variant = 'soft' }) => {
  const styles = {
    soft:    'bg-rose-50  text-rose-400  border border-rose-200',
    pending: 'bg-rose-100 text-rose-500  border border-rose-200',
  };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-light tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
};

const BondLanding = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading]               = useState(true);
  const [bondStatus, setBondStatus]         = useState(null);
  const [sentRequests, setSentRequests]     = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchResults, setSearchResults]   = useState([]);
  const [followLoading, setFollowLoading]   = useState(false);

  useEffect(() => { fetchBondStatus(); }, []);

  const fetchBondStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bond/status');
      const { status, partner, sentRequests, receivedRequests, bondId } = res.data;
      setBondStatus(status);
      setSentRequests(sentRequests || []);
      setReceivedRequests(receivedRequests || []);
      if (status === 'bonded') navigate('/bond/dashboard', { state: { bondId, partner } });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const searchUsers = async (query) => {
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const res = await api.get(`/users/search?q=${query}`);
      setSearchResults(res.data.filter(u => u.username !== user.username));
    } catch (err) { console.error(err); }
  };

  const sendRequest = async (username) => {
    try { await api.post(`/bond/request/${username}`); fetchBondStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Failed to send request'); }
  };

  const acceptRequest = async (userId) => {
    setFollowLoading(true);
    try { await api.post(`/bond/accept/${userId}`); fetchBondStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Accept failed'); }
    finally { setFollowLoading(false); }
  };

  const rejectRequest = async (userId) => {
    try { await api.post(`/bond/reject/${userId}`); fetchBondStatus(); }
    catch (err) { alert(err.response?.data?.error || 'Reject failed'); }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
          <Heart className="absolute inset-0 m-auto w-5 h-5 text-rose-500 fill-rose-200 animate-pulse" />
        </div>
        <p className="text-rose-400 text-sm font-light italic">Finding your match…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50/40">

      {/* Soft background blobs — rose-100/200, same tones as Navbar border/bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-rose-100/50 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-14">

        {/* ── Hero ── */}
        <motion.div
          className="text-center mb-12"
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
        >
          {/* Brand pill — bg-rose-50 border-rose-200 mirrors Navbar search pill */}
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-500 text-xs px-5 py-2 rounded-full mb-6 font-light tracking-widest uppercase">
            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
            HeartLock Bonds
          </div>

          {/* Logo gradient: from-rose-600 to-rose-400 — exact match to Navbar "HeartLock" logo */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
            <span className="bg-gradient-to-r from-rose-600 to-rose-400 bg-clip-text text-transparent">
              Find Your
            </span>
            <br />
            <span className="text-gray-700">Perfect Bond</span>
          </h1>

          {/* "Welcome, username" italic style from Navbar */}
          <p className="text-rose-400 font-light italic text-base">
            Connect with your soulmate, {user.username}.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-12 bg-rose-200" />
            <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
            <div className="h-px w-12 bg-rose-200" />
          </div>
        </motion.div>

        {/* ── Search bar — mirrors Navbar desktop search exactly ── */}
        <motion.div
          className="mb-10"
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
        >
          <div className="flex items-center space-x-2 bg-white border border-rose-200 rounded-full px-5 py-3
                          hover:bg-rose-50 focus-within:bg-rose-50 focus-within:border-rose-400
                          hover:border-rose-300 shadow-sm transition-all duration-300">
            <Search className="w-4 h-4 text-rose-400 shrink-0" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); searchUsers(e.target.value); }}
              className="flex-1 bg-transparent text-gray-600 placeholder-gray-400 text-sm focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="text-gray-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-center text-gray-400 text-xs mt-2.5 font-light">
            Type at least 2 characters to search
          </p>
        </motion.div>

        {/* ── Search Results ── */}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Results
              </p>
              <Card className="overflow-hidden divide-y divide-rose-50">
                {searchResults.map((u, i) => (
                  <motion.div
                    key={u._id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-rose-50 transition-colors"
                    variants={fadeUp} initial="hidden" animate="visible" custom={i}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} />
                      <span className="text-gray-700 font-medium text-sm">{u.username}</span>
                    </div>
                    {sentRequests.some(r => r._id === u._id) ? (
                      <Chip variant="soft">Sent ✓</Chip>
                    ) : (
                      <motion.button
                        whileHover="hover" whileTap="tap" variants={iconVariants}
                        onClick={() => sendRequest(u.username)}
                        className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600
                                   hover:from-rose-600 hover:to-rose-700 text-white text-xs
                                   px-4 py-2 rounded-full shadow-sm transition-all font-medium"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Connect
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pending Requests ── */}
        {bondStatus === 'pending' && (
          <motion.div
            className="grid sm:grid-cols-2 gap-5"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            {/* Received */}
            {receivedRequests.length > 0 && (
              <Card className="p-5">
                <h2 className="text-gray-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" /> Received
                </h2>
                <ul className="space-y-2">
                  {receivedRequests.map((req, i) => (
                    <motion.li
                      key={req._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100"
                      variants={fadeUp} initial="hidden" animate="visible" custom={i}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={req.username} />
                        <span className="text-gray-700 text-sm font-medium">{req.username}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <motion.button
                          whileHover="hover" whileTap="tap" variants={iconVariants}
                          onClick={() => acceptRequest(req._id)} disabled={followLoading}
                          className="p-2 bg-white border border-rose-200 text-rose-500
                                     hover:bg-rose-500 hover:text-white hover:border-rose-500
                                     rounded-full transition-all disabled:opacity-40 shadow-sm"
                          title="Accept"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover="hover" whileTap="tap" variants={iconVariants}
                          onClick={() => rejectRequest(req._id)}
                          className="p-2 bg-white border border-rose-100 text-gray-400
                                     hover:bg-rose-50 hover:text-rose-400 hover:border-rose-200
                                     rounded-full transition-all shadow-sm"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Sent */}
            {sentRequests.length > 0 && (
              <Card className="p-5">
                <h2 className="text-gray-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-rose-400" /> Sent
                </h2>
                <ul className="space-y-2">
                  {sentRequests.map((req, i) => (
                    <motion.li
                      key={req._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100"
                      variants={fadeUp} initial="hidden" animate="visible" custom={i}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={req.username} />
                        <span className="text-gray-700 text-sm font-medium">{req.username}</span>
                      </div>
                      <Chip variant="pending">Pending</Chip>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            )}

            {/* No requests */}
            {receivedRequests.length === 0 && sentRequests.length === 0 && (
              <div className="col-span-2">
                <Card className="py-14 text-center">
                  <Users className="w-10 h-10 text-rose-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-light">No pending requests</p>
                  <p className="text-gray-400 text-xs mt-1 font-light italic">
                    Search above to connect with someone!
                  </p>
                </Card>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Empty state ── */}
        {!searchQuery && bondStatus !== 'pending' && (
          <motion.div
            className="text-center py-12"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            {/* bg-rose-100 ring — mirrors Navbar active link bg-rose-100 */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-rose-100 animate-pulse" />
              <HeartHandshake className="absolute inset-0 m-auto w-9 h-9 text-rose-500" />
            </div>
            <p className="text-gray-600 font-medium">Find your perfect match</p>
            <p className="text-gray-400 text-sm font-light mt-1 italic">
              Search for a username to get started
            </p>
            {/* Animated dots — rose-400, mirrors Navbar active dot */}
            <div className="flex justify-center gap-1.5 mt-5">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-rose-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer — rose-400 italic, mirrors Navbar "Welcome, username" tone */}
      <p className="text-center text-rose-300 text-xs font-light italic pb-8">
        ♡ &nbsp; HeartLock &nbsp;·&nbsp; One bond, infinite moments &nbsp; ♡
      </p>
    </div>
  );
};

export default BondLanding;