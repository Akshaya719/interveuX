import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const STATUS_COLORS = {
  scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  completed: 'text-slate-400 bg-slate-700/50 border-slate-600',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const FILTERS = ['All', 'Scheduled', 'Active', 'Completed', 'Cancelled'];
const EMPTY_FORM = { title: '', language: 'javascript', duration: 60, candidateId: '' };

const InterviewerDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const fetchInterviews = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/interviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCandidates = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/auth/candidates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    if (token) {
      fetchInterviews(); 
      fetchCandidates();
    }
  }, [token]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (interview) => {
    setForm({ 
      title: interview.title, 
      language: interview.language, 
      duration: interview.duration, 
      candidateId: interview.candidateId?._id || '' 
    });
    setEditing(interview._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await axios.put(`http://localhost:5001/api/interviews/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInterviews(prev => prev.map(i => i._id === editing ? res.data : i));
      } else {
        const res = await axios.post('http://localhost:5001/api/interviews', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInterviews(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/interviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(prev => prev.filter(i => i._id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = interviews
    .filter(i => filter === 'All' || i.status === filter.toLowerCase())
    .filter(i => {
      const q = search.toLowerCase();
      return i.title?.toLowerCase().includes(q) || i.candidateId?.name?.toLowerCase().includes(q);
    });

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans">
      <header className="bg-[#161b22] border-b border-slate-700/80 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-emerald-400 tracking-tight">IntervueX</span>
          <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">Interviewer Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/interviewer/questions')}
            className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition text-slate-300">
            📚 Question Bank
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {user?.name}
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition text-slate-300">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Interviews</h2>
            <p className="text-slate-400 text-sm mt-0.5">{interviews.length} total · {interviews.filter(i => i.status === 'active').length} active</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-lg shadow-emerald-900/40 text-sm">
            <span className="text-lg leading-none">+</span> New Interview
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-slate-800/60 border border-slate-700 p-1 rounded-lg">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                {f}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search by title or candidate..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg font-medium">No interviews found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(interview => (
              <div key={interview._id} className="bg-[#161b22] border border-slate-700/80 rounded-xl p-5 flex flex-col gap-4 hover:border-slate-500 transition-all shadow-md">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-white text-base leading-tight">{interview.title}</h3>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[interview.status] || STATUS_COLORS.scheduled}`}>
                    {interview.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400">
                  <div><p className="text-slate-500 mb-0.5">Language</p><p className="text-slate-300 font-medium capitalize">{interview.language}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Duration</p><p className="text-slate-300 font-medium">{interview.duration} min</p></div>
                  <div><p className="text-slate-500 mb-0.5">Question</p><p className="text-slate-300 font-medium">{interview.questionId?.title || '—'}</p></div>
                  <div><p className="text-slate-500 mb-0.5">Created</p><p className="text-slate-300 font-medium">{new Date(interview.createdAt).toLocaleDateString()}</p></div>
                </div>
                <div className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500 mb-0.5">Room ID</p>
                  <p className="font-mono text-xs text-slate-300 truncate">{interview.roomId}</p>
                </div>
                <div className="flex gap-2 mt-auto pt-1">
                  <button onClick={() => navigate(`/workspace/${interview.roomId}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold transition">
                    {interview.status === 'active' ? '▶ Resume' : '▶ Start'}
                  </button>
                  <button onClick={() => openEdit(interview)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition text-sm" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => navigate(`/interviewer/summary/${interview.roomId}`)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition text-sm" title="Summary">
                    📊
                  </button>
                  <button onClick={() => handleDelete(interview._id)}
                    className="px-3 py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 border border-slate-700 rounded-lg text-slate-400 transition text-sm" title="Delete">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">{editing ? 'Edit Interview' : 'Create New Interview'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Interview Title</label>
                <input required type="text" placeholder="e.g. Software Engineer — Round 1"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition text-sm" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Primary Language</label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition text-sm">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Assign Candidate (Optional)</label>
                <select value={form.candidateId} onChange={e => setForm({ ...form, candidateId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition text-sm">
                  <option value="">-- No Candidate Assigned --</option>
                  {candidates.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Duration (minutes)</label>
                <input type="number" min="15" max="180" value={form.duration}
                  onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-lg font-medium transition text-sm">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-semibold transition text-sm shadow shadow-emerald-900/50">
                  {editing ? 'Save Changes' : 'Create Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
