import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const DIFF_COLORS = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const EMPTY_FORM = {
  title: '', description: '', difficulty: 'Easy', tags: '', companies: '',
  constraints: '', hints: '', solution: '',
  starterCode: { javascript: '', python: '', cpp: '', java: '' },
  visibleTestCases: [{ input: '', expectedOutput: '' }],
  hiddenTestCases: [{ input: '', expectedOutput: '' }],
};

const QuestionBank = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeCodeLang, setActiveCodeLang] = useState('javascript');

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (difficulty !== 'All') params.set('difficulty', difficulty);
      const res = await axios.get(`http://localhost:5001/api/questions?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchQuestions(); }, [search, difficulty]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit = (q) => {
    setForm({
      ...q,
      tags: q.tags?.join(', ') || '',
      companies: q.companies?.join(', ') || '',
      hints: q.hints?.join('\n') || '',
      starterCode: q.starterCode || EMPTY_FORM.starterCode,
    });
    setEditing(q._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      companies: form.companies.split(',').map(c => c.trim()).filter(Boolean),
      hints: form.hints.split('\n').map(h => h.trim()).filter(Boolean),
    };
    try {
      if (editing) {
        await axios.put(`http://localhost:5001/api/questions/${editing}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:5001/api/questions', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchQuestions();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await axios.delete(`http://localhost:5001/api/questions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchQuestions();
  };

  const updateTC = (arr, setter, i, field, value) => {
    const updated = [...arr];
    updated[i] = { ...updated[i], [field]: value };
    setter(updated);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans">
      <header className="bg-[#161b22] border-b border-slate-700/80 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/interviewer/dashboard')} className="text-slate-500 hover:text-slate-300 text-sm transition">← Dashboard</button>
          <span className="text-xl font-bold text-white">Question Bank</span>
        </div>
        <button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
          + New Question
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-slate-800/60 border border-slate-700 p-1 rounded-lg">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${difficulty === d ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                {d}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition" />
        </div>

        {/* Table */}
        <div className="bg-[#161b22] border border-slate-700/80 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 border-b border-slate-700">
              <tr>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">#</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">Title</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">Difficulty</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">Tags</th>
                <th className="text-left px-5 py-3 text-slate-400 font-semibold">Tests</th>
                <th className="text-right px-5 py-3 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-500">No questions yet. Create your first one!</td></tr>
              ) : (
                questions.map((q, i) => (
                  <tr key={q._id} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-200">{q.title}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {q.tags?.slice(0, 3).map((tag, ti) => (
                          <span key={ti} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {q.visibleTestCases?.length || 0}V / {q.hiddenTestCases?.length || 0}H
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(q)} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded transition">Edit</button>
                        <button onClick={() => handleDelete(q._id)} className="text-xs bg-red-900/40 hover:bg-red-800/60 text-red-400 px-3 py-1.5 rounded transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-slate-700 rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-[#161b22] rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Question' : 'Create Question'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Title *</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Difficulty *</label>
                  <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Description *</label>
                <textarea required rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Array, HashMap, Sliding Window"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Companies (comma-separated)</label>
                  <input value={form.companies} onChange={e => setForm({ ...form, companies: e.target.value })} placeholder="Google, Amazon, Meta"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Constraints</label>
                <input value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })} placeholder="1 ≤ n ≤ 10^5"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Hints (one per line)</label>
                <textarea rows={2} value={form.hints} onChange={e => setForm({ ...form, hints: e.target.value })} placeholder="Think about using a two-pointer approach..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition resize-none" />
              </div>

              {/* Starter Code Tabs */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Starter Code</label>
                <div className="flex gap-1 mb-2">
                  {['javascript', 'python', 'cpp', 'java'].map(lang => (
                    <button key={lang} type="button" onClick={() => setActiveCodeLang(lang)}
                      className={`px-3 py-1 text-xs rounded font-medium transition ${activeCodeLang === lang ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                      {lang}
                    </button>
                  ))}
                </div>
                <textarea rows={4} value={form.starterCode?.[activeCodeLang] || ''}
                  onChange={e => setForm({ ...form, starterCode: { ...form.starterCode, [activeCodeLang]: e.target.value } })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-emerald-500 transition resize-none" />
              </div>

              {/* Visible Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Visible Test Cases</label>
                  <button type="button" onClick={() => setForm({ ...form, visibleTestCases: [...form.visibleTestCases, { input: '', expectedOutput: '' }] })}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition">+ Add</button>
                </div>
                {form.visibleTestCases?.map((tc, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                    <input value={tc.input} placeholder="Input" onChange={e => {
                      const updated = [...form.visibleTestCases]; updated[i] = { ...updated[i], input: e.target.value };
                      setForm({ ...form, visibleTestCases: updated });
                    }} className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
                    <input value={tc.expectedOutput} placeholder="Expected Output" onChange={e => {
                      const updated = [...form.visibleTestCases]; updated[i] = { ...updated[i], expectedOutput: e.target.value };
                      setForm({ ...form, visibleTestCases: updated });
                    }} className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
                  </div>
                ))}
              </div>

              {/* Hidden Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-slate-400">Hidden Test Cases</label>
                  <button type="button" onClick={() => setForm({ ...form, hiddenTestCases: [...form.hiddenTestCases, { input: '', expectedOutput: '' }] })}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition">+ Add</button>
                </div>
                {form.hiddenTestCases?.map((tc, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                    <input value={tc.input} placeholder="Input" onChange={e => {
                      const updated = [...form.hiddenTestCases]; updated[i] = { ...updated[i], input: e.target.value };
                      setForm({ ...form, hiddenTestCases: updated });
                    }} className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
                    <input value={tc.expectedOutput} placeholder="Expected Output" onChange={e => {
                      const updated = [...form.hiddenTestCases]; updated[i] = { ...updated[i], expectedOutput: e.target.value };
                      setForm({ ...form, hiddenTestCases: updated });
                    }} className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-lg text-sm transition">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                  {editing ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
