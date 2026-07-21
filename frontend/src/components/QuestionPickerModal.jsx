import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const DIFF_COLORS = {
  Easy: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  Medium: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  Hard: 'text-red-400 border-red-400/30 bg-red-400/10',
};

const QuestionPickerModal = ({ onSelect, onClose }) => {
  const { token } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (difficulty !== 'All') params.set('difficulty', difficulty);
        const res = await axios.get(`http://localhost:5001/api/questions?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(res.data);
      } catch (e) {
        console.error('Failed to fetch questions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [search, difficulty, token]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#161b22] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-bold text-white">Pick a Question</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl leading-none transition">×</button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-700/60 flex gap-3 shrink-0">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <div className="flex gap-1 bg-slate-800/60 border border-slate-700 p-1 rounded-lg">
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded text-xs font-medium transition ${difficulty === d ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-slate-500 animate-pulse">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-slate-400 font-medium">No questions found.</p>
              <p className="text-slate-600 text-sm mt-1">
                Go to the{' '}
                <span className="text-blue-400 cursor-pointer hover:underline" onClick={onClose}>
                  Question Bank
                </span>{' '}
                to create some questions first.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {questions.map(q => (
                <button
                  key={q._id}
                  onClick={() => onSelect(q)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-800/60 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 group-hover:text-white transition text-sm">{q.title}</p>
                      <p className="text-slate-500 text-xs mt-1 truncate">{q.description?.slice(0, 80)}...</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.tags?.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${DIFF_COLORS[q.difficulty] || DIFF_COLORS.Medium}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-slate-600">{q.visibleTestCases?.length || 0}V · {q.hiddenTestCases?.length || 0}H tests</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPickerModal;
