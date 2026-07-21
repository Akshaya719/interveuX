import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { io } from 'socket.io-client';

const CandidateDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({ upcomingCount: 0, completedCount: 0, averageScore: 0, successRate: 0 });
  const [notifications, setNotifications] = useState([]);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let socket;
    const fetchData = async () => {
      try {
        const [interviewsRes, statsRes, notifRes] = await Promise.all([
          axios.get('http://localhost:5001/api/interviews', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/interviews/candidate/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5001/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setInterviews(interviewsRes.data);
        setStats(statsRes.data);
        setNotifications(notifRes.data);
      } catch (error) {
        console.error('Failed to fetch candidate data', error);
      }
    };
    
    if (token && user) {
      fetchData();
      
      // Initialize Socket connection
      socket = io('http://localhost:5001');
      socket.emit('register-user', user.id);
      
      socket.on('new-notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        // Also refresh interviews to show the new one
        axios.get('http://localhost:5001/api/interviews', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => setInterviews(res.data)).catch(console.error);
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [token, user]);

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:5001/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { console.error(e); }
  };

  const handleJoinByRoomId = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinRoomId.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5001/api/interviews/${joinRoomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        navigate(`/workspace/${joinRoomId}`);
      }
    } catch (e) {
      setJoinError('Invalid Room ID or interview not found.');
    }
  };

  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled' || i.status === 'active');
  const completedInterviews = interviews.filter(i => i.status === 'completed');

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-slate-700/80 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">IntervueX</span>
          <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Candidate Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm border border-emerald-500/30">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {user?.name}
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-slate-400 hover:text-white transition">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* Top Section: Welcome & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-[#161b22] to-slate-900 border border-slate-700/80 rounded-2xl p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-white mb-2">👋 Welcome, {user?.name}</h1>
            <p className="text-slate-400 mb-6 max-w-lg leading-relaxed">Ready for your next challenge? Join your assigned interviews below or enter a room code provided by your interviewer.</p>
            
            <div className="flex gap-6">
              <div>
                <p className="text-3xl font-bold text-emerald-400">{stats.upcomingCount}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Upcoming</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-3xl font-bold text-blue-400">{stats.completedCount}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Completed</p>
              </div>
              <div className="w-px bg-slate-700" />
              <div>
                <p className="text-3xl font-bold text-amber-400">{stats.averageScore}%</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Avg Score</p>
              </div>
            </div>
          </div>

          {/* Join Card */}
          <div className="col-span-1 bg-[#161b22] border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-white mb-2">Have an Interview Code?</h2>
            <p className="text-sm text-slate-400 mb-4">Enter the Room ID below to join.</p>
            <form onSubmit={handleJoinByRoomId} className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Paste Room ID..." 
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {joinError && <p className="text-xs text-red-400">{joinError}</p>}
              <button type="submit" disabled={!joinRoomId.trim()} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2.5 rounded-lg font-semibold transition text-sm">
                Join Interview
              </button>
            </form>
          </div>
        </div>

        {/* Content Section: Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="col-span-2 space-y-8">
            {/* Upcoming Interviews */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                Upcoming Interviews
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full">{upcomingInterviews.length}</span>
              </h2>
              <div className="space-y-4">
                {upcomingInterviews.length === 0 ? (
                  <div className="bg-[#161b22]/50 border border-slate-800 rounded-xl p-8 text-center border-dashed">
                    <p className="text-slate-500 text-sm">No upcoming interviews assigned to you.</p>
                  </div>
                ) : (
                  upcomingInterviews.map(interview => (
                    <div key={interview._id} className="bg-[#161b22] border border-slate-700/80 rounded-xl p-5 hover:border-slate-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{interview.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <p>Interviewer: <span className="text-slate-300 font-medium">Rahul Sharma</span></p> {/* Mocked interviewer name for now */}
                          <p>Language: <span className="text-slate-300 font-medium capitalize">{interview.language}</span></p>
                          <p>Duration: <span className="text-slate-300 font-medium">{interview.duration} Min</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold self-start sm:self-auto ${interview.status === 'active' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-blue-400 bg-blue-400/10 border-blue-400/30'}`}>
                          {interview.status === 'active' ? 'Active Now' : 'Scheduled'}
                        </span>
                        <button onClick={() => navigate(`/workspace/${interview.roomId}`)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                          Join Interview
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Previous Interviews */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                Previous Interviews
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{completedInterviews.length}</span>
              </h2>
              <div className="space-y-4">
                {completedInterviews.length === 0 ? (
                  <div className="bg-[#161b22]/50 border border-slate-800 rounded-xl p-8 text-center border-dashed">
                    <p className="text-slate-500 text-sm">No completed interviews yet.</p>
                  </div>
                ) : (
                  completedInterviews.map(interview => (
                    <div key={interview._id} className="bg-[#161b22] border border-slate-700/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-300 text-base mb-1">{interview.title}</h3>
                        <p className="text-xs text-slate-500">Completed on {new Date(interview.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Score</p>
                          <p className="font-bold text-emerald-400 text-lg">82%</p> {/* Mock score pending actual DB integration */}
                        </div>
                        <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition cursor-not-allowed opacity-50" title="Report not yet available">
                          View Report
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Notifications */}
          <div className="col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                )}
              </h2>
              {notifications.some(n => !n.read) && (
                <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
              )}
            </div>
            
            <div className="bg-[#161b22] border border-slate-700/80 rounded-xl p-2 divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  You have no new notifications.
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif._id} className={`p-4 transition ${notif.read ? 'opacity-60' : 'bg-slate-800/30'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-medium ${notif.read ? 'text-slate-400' : 'text-slate-200'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CandidateDashboard;
