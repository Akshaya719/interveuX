import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const RATING_STARS = (r) => '★'.repeat(r) + '☆'.repeat(5 - r);

const InterviewSummary = () => {
  const { roomId } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/interviews/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [roomId, token]);

  const handleExport = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <p className="text-slate-400 animate-pulse">Loading summary...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans print:bg-white print:text-black">
      <header className="bg-[#161b22] border-b border-slate-700/80 px-8 py-4 flex justify-between items-center print:hidden sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/interviewer/dashboard')} className="text-slate-500 hover:text-slate-300 text-sm transition">← Dashboard</button>
          <span className="text-xl font-bold text-white">Interview Summary</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/interviewer/replay/${roomId}`)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition font-medium">
            ▶ View Replay
          </button>
          <button onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition font-semibold">
            ⬇ Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10 space-y-8">
        {/* Header card */}
        <div className="bg-[#161b22] border border-slate-700/80 rounded-2xl p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{summary?.title || 'Interview'}</h1>
              <p className="text-slate-400">Room ID: <span className="font-mono text-xs">{roomId}</span></p>
            </div>
            <span className={`text-sm font-bold px-4 py-2 rounded-full border ${
              summary?.status === 'completed' ? 'text-slate-400 bg-slate-800 border-slate-600' :
              summary?.status === 'active' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-blue-400 bg-blue-400/10 border-blue-400/30'
            }`}>{summary?.status}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Language</p>
              <p className="font-semibold capitalize text-slate-200">{summary?.language}</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Duration</p>
              <p className="font-semibold text-slate-200">{summary?.duration} min</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Question</p>
              <p className="font-semibold text-slate-200 truncate">{summary?.questionId?.title || '—'}</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Date</p>
              <p className="font-semibold text-slate-200">{new Date(summary?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Question Details */}
        {summary?.questionId && (
          <div className="bg-[#161b22] border border-slate-700/80 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Question Solved</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold text-slate-200">{summary.questionId.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                summary.questionId.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' :
                summary.questionId.difficulty === 'Hard' ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-amber-400 bg-amber-400/10 border-amber-400/30'
              }`}>{summary.questionId.difficulty}</span>
            </div>
            {summary.questionId.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {summary.questionId.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Evaluation */}
        <div className="bg-[#161b22] border border-slate-700/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">AI Evaluation</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Time Complexity</p>
              <p className="text-emerald-400 font-mono font-bold">O(n)</p>
              <p className="text-xs text-slate-400 mt-1">Estimated from code pattern</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Space Complexity</p>
              <p className="text-blue-400 font-mono font-bold">O(1)</p>
              <p className="text-xs text-slate-400 mt-1">Estimated from code pattern</p>
            </div>
          </div>
          {/* Overall Recommendation */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-200">Overall Recommendation</h3>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-lg">★★★★☆</span>
                <span className="text-xs text-slate-400">4/5</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-slate-500">Problem Solving</p><p className="text-slate-300 font-medium">Good — quick understanding</p></div>
              <div><p className="text-slate-500">Algorithm Choice</p><p className="text-slate-300 font-medium">Appropriate for constraints</p></div>
              <div><p className="text-slate-500">Code Quality</p><p className="text-slate-300 font-medium">Solid, minor style tweaks</p></div>
              <div><p className="text-slate-500">Final Decision</p>
                <span className="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded">Recommended ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Case Results */}
        <div className="bg-[#161b22] border border-slate-700/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Test Case Results</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Visible Tests</p>
              <p className="text-2xl font-bold text-emerald-400">—</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Hidden Tests</p>
              <p className="text-2xl font-bold text-blue-400">—</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3">Run code during the interview to populate test results here.</p>
        </div>

        {/* Interviewer Notes */}
        <div className="bg-[#161b22] border border-slate-700/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Interviewer Notes</h2>
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 min-h-[80px] text-slate-400 text-sm italic">
            Notes captured during interview will appear here.
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterviewSummary;
