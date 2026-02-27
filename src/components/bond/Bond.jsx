import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  Heart, Calendar, Image, Target, Smile, Lock, HeartHandshake,
  Camera, BookOpen, CheckCircle, Shield, Edit2, Save, Plus, Trash2, X
} from 'lucide-react';

const Bond = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [bondData, setBondData] = useState(null);
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [partnerInput, setPartnerInput] = useState('');

  // Load bond data from backend
  useEffect(() => {
    fetchBondData();
  }, []);

  const fetchBondData = async () => {
    try {
      const res = await api.get('/bond/data');
      setBondData(res.data);
      setPartnerInput(res.data.partnerName || '');
      setIsEditingPartner(!res.data.partnerName); // show input if no partner yet
    } catch (err) {
      console.error('Failed to load bond data', err);
    } finally {
      setLoading(false);
    }
  };

  // Save bond data to backend
  const saveBondData = async (updates) => {
    try {
      const newData = { ...bondData, ...updates };
      setBondData(newData);
      await api.put('/bond/data', newData);
    } catch (err) {
      console.error('Failed to save bond data', err);
    }
  };

  // Helper to update a field
  const updateField = (field, value) => {
    saveBondData({ [field]: value });
  };

  // Partner name handling
  const savePartnerName = () => {
    if (partnerInput.trim()) {
      saveBondData({ partnerName: partnerInput.trim() });
      setIsEditingPartner(false);
    }
  };

  // Add item to an array field
  const addItem = (field, item) => {
    const newItem = { ...item, id: Date.now() };
    saveBondData({ [field]: [...(bondData[field] || []), newItem] });
  };

  // Update item in an array field
  const updateItem = (field, id, updates) => {
    const updatedArray = bondData[field].map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    saveBondData({ [field]: updatedArray });
  };

  // Delete item from an array field
  const deleteItem = (field, id) => {
    const filtered = bondData[field].filter(item => item.id !== id);
    saveBondData({ [field]: filtered });
  };

  // Calculate days together from startDate
  const daysTogether = bondData?.startDate
    ? Math.floor((new Date() - new Date(bondData.startDate)) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate goals met
  const goalsMet = bondData?.goals?.filter(g => g.completed).length || 0;

  // Form states for adding new items
  const [newMemory, setNewMemory] = useState({ date: '', text: '' });
  const [newDiary, setNewDiary] = useState({ date: '', text: '' });
  const [newGoal, setNewGoal] = useState({ text: '', completed: false });
  const [newCommitment, setNewCommitment] = useState('');

  // Editing states
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [editingDiaryId, setEditingDiaryId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editingCommitmentId, setEditingCommitmentId] = useState(null);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div></div>;
  if (!bondData) return <div className="min-h-screen flex items-center justify-center">Failed to load bond data.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with partner name */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <HeartHandshake className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold text-gray-800">Bond</h1>
          </div>

          {isEditingPartner ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                placeholder="Enter your partner's name"
                className="px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
              />
              <button
                onClick={savePartnerName}
                className="p-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition"
                title="Save"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm text-gray-600">with</span>
                <div className="h-6 w-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs font-bold">
                  {bondData.partnerName?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{bondData.partnerName}</span>
              </div>
              <button
                onClick={() => setIsEditingPartner(true)}
                className="p-2 text-gray-400 hover:text-rose-500 transition"
                title="Edit partner name"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Heart className="w-6 h-6 text-rose-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{bondData.connectionStrength}%</p>
            <p className="text-xs text-gray-400">Connection</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Calendar className="w-6 h-6 text-rose-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{daysTogether}</p>
            <p className="text-xs text-gray-400">Days together</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Camera className="w-6 h-6 text-rose-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{bondData.sharedPhotos}</p>
            <p className="text-xs text-gray-400">Photos</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Target className="w-6 h-6 text-rose-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{goalsMet}/{bondData.goals.length}</p>
            <p className="text-xs text-gray-400">Goals met</p>
          </div>
        </div>

        {/* Cards Grid – same as before, but using updateField, addItem, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Relationship Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Relationship Overview</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Bond status</span>
                <input
                  type="text"
                  value={bondData.bondStatus}
                  onChange={(e) => updateField('bondStatus', e.target.value)}
                  className="text-right font-semibold text-rose-600 border-b border-transparent focus:border-rose-200 focus:outline-none px-1 w-24"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Anniversary</span>
                <input
                  type="date"
                  value={bondData.anniversary}
                  onChange={(e) => updateField('anniversary', e.target.value)}
                  className="text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Started on</span>
                <input
                  type="date"
                  value={bondData.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connection strength</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bondData.connectionStrength}
                    onChange={(e) => updateField('connectionStrength', parseInt(e.target.value) || 0)}
                    className="w-16 text-right border-b border-transparent focus:border-rose-200 focus:outline-none px-1"
                  />%
                </div>
              </div>
            </div>
          </div>

          {/* Memories & Moments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <Image className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Memories & Moments</h2>
              </div>
              <button
                onClick={() => setNewMemory({ date: '', text: '' })}
                className="p-1 text-rose-500 hover:text-rose-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {newMemory.date !== undefined && (
              <div className="mb-3 p-3 bg-rose-50 rounded-lg">
                <input
                  type="date"
                  value={newMemory.date}
                  onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                  className="w-full mb-2 px-2 py-1 border border-gray-200 rounded"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newMemory.text}
                  onChange={(e) => setNewMemory({ ...newMemory, text: e.target.value })}
                  className="w-full mb-2 px-2 py-1 border border-gray-200 rounded"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setNewMemory({})} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (newMemory.date && newMemory.text) {
                        addItem('memories', { date: newMemory.date, text: newMemory.text });
                        setNewMemory({});
                      }
                    }}
                    className="p-1 text-rose-500 hover:text-rose-600"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <ul className="space-y-2 text-sm">
              {bondData.memories.map(mem => (
                <li key={mem.id} className="flex items-center justify-between group">
                  {editingMemoryId === mem.id ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="date"
                        value={mem.date}
                        onChange={(e) => updateItem('memories', mem.id, { date: e.target.value })}
                        className="w-28 px-1 py-0.5 border border-gray-200 rounded"
                      />
                      <input
                        type="text"
                        value={mem.text}
                        onChange={(e) => updateItem('memories', mem.id, { text: e.target.value })}
                        className="flex-1 px-1 py-0.5 border border-gray-200 rounded"
                      />
                      <button onClick={() => setEditingMemoryId(null)} className="text-green-500">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-600">
                        <span className="text-gray-400">{mem.date}</span> – {mem.text}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                        <button onClick={() => setEditingMemoryId(mem.id)} className="text-gray-400 hover:text-rose-500">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteItem('memories', mem.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Diary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Diary</h2>
              </div>
              <button onClick={() => setNewDiary({ date: '', text: '' })} className="p-1 text-rose-500 hover:text-rose-600">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {newDiary.date !== undefined && (
              <div className="mb-3 p-3 bg-rose-50 rounded-lg">
                <input
                  type="date"
                  value={newDiary.date}
                  onChange={(e) => setNewDiary({ ...newDiary, date: e.target.value })}
                  className="w-full mb-2 px-2 py-1 border border-gray-200 rounded"
                />
                <textarea
                  placeholder="Entry"
                  value={newDiary.text}
                  onChange={(e) => setNewDiary({ ...newDiary, text: e.target.value })}
                  className="w-full mb-2 px-2 py-1 border border-gray-200 rounded"
                  rows="2"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => setNewDiary({})} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (newDiary.date && newDiary.text) {
                        addItem('diaryEntries', { date: newDiary.date, text: newDiary.text });
                        setNewDiary({});
                      }
                    }}
                    className="p-1 text-rose-500 hover:text-rose-600"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <ul className="space-y-2 text-sm">
              {bondData.diaryEntries.map(entry => (
                <li key={entry.id} className="flex items-start justify-between group">
                  {editingDiaryId === entry.id ? (
                    <div className="flex-1 flex items-start space-x-2">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateItem('diaryEntries', entry.id, { date: e.target.value })}
                        className="w-28 px-1 py-0.5 border border-gray-200 rounded"
                      />
                      <textarea
                        value={entry.text}
                        onChange={(e) => updateItem('diaryEntries', entry.id, { text: e.target.value })}
                        className="flex-1 px-1 py-0.5 border border-gray-200 rounded"
                        rows="1"
                      />
                      <button onClick={() => setEditingDiaryId(null)} className="text-green-500">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-600">
                        <span className="text-gray-400">{entry.date}</span> – {entry.text}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                        <button onClick={() => setEditingDiaryId(entry.id)} className="text-gray-400 hover:text-rose-500">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteItem('diaryEntries', entry.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Promises & Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Target className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Promises & Goals</h2>
            </div>

            {/* Goals */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Couple goals</h3>
                <button onClick={() => setNewGoal({ text: '', completed: false })} className="p-1 text-rose-500 hover:text-rose-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {newGoal.text !== undefined && (
                <div className="mb-3 p-3 bg-rose-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Goal"
                    value={newGoal.text}
                    onChange={(e) => setNewGoal({ ...newGoal, text: e.target.value })}
                    className="w-full mb-2 px-2 py-1 border border-gray-200 rounded"
                  />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setNewGoal({})} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (newGoal.text) {
                          addItem('goals', { text: newGoal.text, completed: false });
                          setNewGoal({});
                        }
                      }}
                      className="p-1 text-rose-500 hover:text-rose-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <ul className="space-y-1 text-sm">
                {bondData.goals.map(goal => (
                  <li key={goal.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={(e) => updateItem('goals', goal.id, { completed: e.target.checked })}
                        className="rounded text-rose-500 focus:ring-rose-200"
                      />
                      {editingGoalId === goal.id ? (
                        <input
                          type="text"
                          value={goal.text}
                          onChange={(e) => updateItem('goals', goal.id, { text: e.target.value })}
                          className="px-1 py-0.5 border border-gray-200 rounded"
                          autoFocus
                        />
                      ) : (
                        <span className={goal.completed ? 'line-through text-gray-400' : 'text-gray-600'}>
                          {goal.text}
                        </span>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                      {editingGoalId === goal.id ? (
                        <button onClick={() => setEditingGoalId(null)} className="text-green-500">
                          <Save className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => setEditingGoalId(goal.id)} className="text-gray-400 hover:text-rose-500">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => deleteItem('goals', goal.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Commitments */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Commitments</h3>
                <button onClick={() => setNewCommitment('')} className="p-1 text-rose-500 hover:text-rose-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {newCommitment !== '' && (
                <div className="mb-3 p-3 bg-rose-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Commitment"
                    value={newCommitment}
                    onChange={(e) => setNewCommitment(e.target.value)}
                    className="w-full mb-2 px-2 py-1 border border-gray-200 rounded"
                  />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setNewCommitment('')} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (newCommitment) {
                          addItem('commitments', { text: newCommitment });
                          setNewCommitment('');
                        }
                      }}
                      className="p-1 text-rose-500 hover:text-rose-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <ul className="space-y-1 text-sm">
                {bondData.commitments.map(cmt => (
                  <li key={cmt.id} className="flex items-center justify-between group">
                    {editingCommitmentId === cmt.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={cmt.text}
                          onChange={(e) => updateItem('commitments', cmt.id, { text: e.target.value })}
                          className="flex-1 px-1 py-0.5 border border-gray-200 rounded"
                        />
                        <button onClick={() => setEditingCommitmentId(null)} className="text-green-500">
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-600">❤️ {cmt.text}</span>
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          <button onClick={() => setEditingCommitmentId(cmt.id)} className="text-gray-400 hover:text-rose-500">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteItem('commitments', cmt.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mood & Connection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Smile className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Mood & Connection</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recent mood</span>
                <select
                  value={bondData.recentMood}
                  onChange={(e) => updateField('recentMood', e.target.value)}
                  className="border-b border-transparent focus:border-rose-200 focus:outline-none"
                >
                  <option value="happy">Happy</option>
                  <option value="excited">Excited</option>
                  <option value="romantic">Romantic</option>
                  <option value="calm">Calm</option>
                  <option value="stressed">Stressed</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Connection health</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={bondData.connectionStrength}
                  onChange={(e) => updateField('connectionStrength', parseInt(e.target.value) || 0)}
                  className="w-16 text-right border-b border-transparent focus:border-rose-200 focus:outline-none"
                />%
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interactions</span>
                <input
                  type="number"
                  value={bondData.interactions}
                  onChange={(e) => updateField('interactions', parseInt(e.target.value) || 0)}
                  className="w-16 text-right border-b border-transparent focus:border-rose-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Privacy & Control */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Lock className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Privacy & Control</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Lock settings</span>
                <span className="text-rose-600">Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Access permissions</span>
                <span className="font-medium">Only you two</span>
              </div>
              <p className="text-sm text-gray-600 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>End-to-end encrypted</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          ❤️ Nurture your connection every day.
        </div>
      </div>
    </div>
  );
};

export default Bond;