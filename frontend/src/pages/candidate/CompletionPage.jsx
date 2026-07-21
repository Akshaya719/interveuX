import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const CompletionPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const { runs = 0, passedTests = 0, totalTests = 0, durationSpent = 0 } = location.state || {};

  const handleReturn = () => {
    navigate('/candidate/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans flex flex-col items-center justify-center p-6">
      
      {/* Header (Minimal) */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <span className="text-xl font-bold text-emerald-400 tracking-tight">IntervueX</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-sm text-slate-500 hover:text-white transition">Logout</button>
        </div>
      </div>

      <div className="bg-[#161b22] border border-slate-700/80 rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🎉</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Interview Completed</h1>
        <p className="text-slate-400 mb-8">Your submission has been recorded successfully.</p>
        
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</p>
            <p className="text-xl font-semibold text-slate-200">{Math.floor(durationSpent / 60)} Min</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Runs</p>
            <p className="text-xl font-semibold text-slate-200">{runs}</p>
          </div>
          <div className="col-span-2 bg-slate-800/40 rounded-lg py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Passed Tests</p>
            <p className="text-2xl font-bold text-emerald-400">{passedTests} <span className="text-slate-500 text-lg font-medium">/ {totalTests}</span></p>
          </div>
        </div>

        <p className="text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 py-3 rounded-lg mb-8">
          Waiting for interviewer feedback...
        </p>

        <button onClick={handleReturn} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-6 py-2.5 rounded-lg font-medium transition w-full">
          Return to Dashboard
        </button>
      </div>

    </div>
  );
};

export default CompletionPage;
