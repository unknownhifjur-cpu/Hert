import React from 'react';
import {
  Heart,
  Calendar,
  Activity,
  Image,
  MessageSquare,
  Clock,
  Target,
  CheckCircle,
  MapPin,
  Smile,
  BarChart3,
  Lock,
  Key,
  Shield,
  HeartHandshake,
} from 'lucide-react';

const Bond = () => {
  // Dummy data – replace with real API data later
  const bondData = {
    status: 'Strong',
    anniversary: 'June 15, 2024',
    specialMoments: [
      { date: '2026-02-14', description: 'Valentine’s Day together' },
      { date: '2026-01-01', description: 'New Year celebration' },
    ],
    sharedPhotos: 23,
    savedNotes: 5,
    memories: [
      { id: 1, text: 'First trip to the mountains', date: '2025-12-10' },
      { id: 2, text: 'Concert night', date: '2025-11-05' },
    ],
    goals: [
      { id: 1, text: 'Travel to Japan', completed: false },
      { id: 2, text: 'Learn to cook together', completed: true },
    ],
    commitments: [
      { id: 1, text: 'Call every evening' },
      { id: 2, text: 'Monthly date night' },
    ],
    moodLogs: [
      { date: '2026-02-26', mood: 'happy' },
      { date: '2026-02-25', mood: 'excited' },
    ],
    bondHealth: 85, // percentage
    interactionCount: 47,
    lockEnabled: true,
  };

  const sections = [
    {
      id: 'overview',
      title: 'Relationship Overview',
      icon: Heart,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bond status</span>
            <span className="font-semibold text-rose-600">{bondData.status}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Anniversary</span>
            <span className="font-medium">{bondData.anniversary}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Connection strength</span>
            <div className="flex items-center space-x-1">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${bondData.bondHealth}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{bondData.bondHealth}%</span>
            </div>
          </div>
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Special moments</h4>
            <ul className="space-y-1 text-sm">
              {bondData.specialMoments.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>{item.date} – {item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'memories',
      title: 'Memories & Moments',
      icon: Image,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Shared photos</span>
            <span className="font-medium">{bondData.sharedPhotos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Saved notes</span>
            <span className="font-medium">{bondData.savedNotes}</span>
          </div>
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Recent memories</h4>
            <ul className="space-y-1 text-sm">
              {bondData.memories.map((mem) => (
                <li key={mem.id} className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>{mem.date} – {mem.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'goals',
      title: 'Promises & Goals',
      icon: Target,
      content: (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Couple goals</h4>
            <ul className="space-y-1 text-sm">
              {bondData.goals.map((goal) => (
                <li key={goal.id} className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${goal.completed ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={goal.completed ? 'line-through text-gray-400' : 'text-gray-600'}>{goal.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Commitments</h4>
            <ul className="space-y-1 text-sm">
              {bondData.commitments.map((item) => (
                <li key={item.id} className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'mood',
      title: 'Mood & Connection Tracker',
      icon: Smile,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Daily mood log</span>
            <span className="text-sm">{bondData.moodLogs.length} entries</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bond health</span>
            <div className="flex items-center space-x-1">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${bondData.bondHealth}%` }}></div>
              </div>
              <span className="text-sm font-medium">{bondData.bondHealth}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Interactions</span>
            <span className="font-medium">{bondData.interactionCount}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'privacy',
      title: 'Privacy & Control',
      icon: Lock,
      content: (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Lock settings</span>
            <span className="font-medium text-rose-600">Enabled</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Access permissions</span>
            <span className="font-medium">Only you</span>
          </div>
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Secure storage</h4>
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>End-to-end encrypted</span>
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <HeartHandshake className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-bold text-gray-800">Bond</h1>
          </div>
          <p className="text-gray-500 mt-2">Your emotional connection hub – track, cherish, and strengthen your relationship.</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-rose-50 rounded-lg">
                  <section.icon className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
              </div>
              {section.content}
            </div>
          ))}
        </div>

        {/* Placeholder for future detailed views */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          More features coming soon – detailed timelines, shared albums, and interactive tools.
        </div>
      </div>
    </div>
  );
};

export default Bond;