import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const INTERVIEWER_TABS = ['Candidate', 'AI Assistant', 'Chat', 'Notes'];
const CANDIDATE_TABS = ['Chat'];

const ControlPanel = ({ code, socket, sessionId, role, candidateInfo, language }) => {
  const [activeTab, setActiveTab] = useState(role === 'interviewer' ? 'Candidate' : 'Chat');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [notes, setNotes] = useState('');
  const messagesEndRef = useRef(null);

  const tabs = role === 'interviewer' ? INTERVIEWER_TABS : CANDIDATE_TABS;

  useEffect(() => {
    if (!socket) return;
    socket.on('chat-message', (msg) => setMessages(prev => [...prev, msg]));
    return () => socket.off('chat-message');
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { text: chatInput, sender: role, timestamp: new Date().toISOString() };
    socket?.emit('chat-message', { sessionId, ...msg });
    setMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const analyzeCode = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/ai/analyze', { code });
      setAiAnalysis(res.data);
      setActiveTab('AI Assistant');
    } catch (e) { console.error(e); }
    finally { setAiLoading(false); }
  };

  const statusColor = (s) => {
    if (s === 'Online') return 'bg-emerald-400';
    if (s === 'Typing...') return 'bg-amber-400 animate-pulse';
    if (s === 'Running Code...') return 'bg-blue-400 animate-pulse';
    return 'bg-slate-500';
  };

  return (
    <div className="h-full flex flex-col bg-[#161b22] border-l border-slate-700/80">
      {/* Tab Bar */}
      <div className="flex items-center flex-wrap gap-1 px-2 py-2 bg-[#0d1117]/60 border-b border-slate-700/80 shrink-0">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1.5 rounded text-xs font-medium transition ${activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── CANDIDATE TAB ── */}
      {activeTab === 'Candidate' && role === 'interviewer' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                {candidateInfo?.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-sm">{candidateInfo?.name || 'Waiting for candidate...'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusColor(candidateInfo?.status)}`} />
                  <span className="text-xs text-slate-400">{candidateInfo?.status || 'Not joined'}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 mb-0.5">Language</p>
                <p className="text-slate-200 font-semibold capitalize">{candidateInfo?.language || language}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 mb-0.5">Code Runs</p>
                <p className="text-slate-200 font-semibold">{candidateInfo?.executions || 0}</p>
              </div>
              <div className="col-span-2 bg-slate-800 rounded-lg p-3">
                <p className="text-slate-500 mb-0.5">Last Activity</p>
                <p className="text-slate-200 font-semibold">
                  {candidateInfo?.lastActivity ? new Date(candidateInfo.lastActivity).toLocaleTimeString() : '—'}
                </p>
              </div>
            </div>
          </div>
          {/* Analyze Code shortcut */}
          <button onClick={analyzeCode} disabled={aiLoading || !code}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm py-2.5 rounded-lg transition font-medium">
            {aiLoading ? '⟳ Analyzing...' : '✨ Run AI Analysis'}
          </button>
        </div>
      )}

      {/* ── AI ASSISTANT TAB ── */}
      {activeTab === 'AI Assistant' && role === 'interviewer' && (
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-700/50 shrink-0">
            <button onClick={analyzeCode} disabled={aiLoading || !code}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm py-2 rounded-lg transition font-medium">
              {aiLoading ? '⟳ Analyzing...' : '✨ Analyze Code'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!aiAnalysis && !aiLoading && (
              <p className="text-slate-600 text-sm text-center mt-8">Click Analyze to get AI-driven evaluation.</p>
            )}
            {aiLoading && (
              <div className="space-y-2 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-800/60 rounded-lg" />)}
              </div>
            )}
            {aiAnalysis && !aiLoading && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Time Complexity</p>
                    <p className="text-emerald-400 font-mono font-bold text-sm">{aiAnalysis.timeComplexity?.split(' ')[0]}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-tight">{aiAnalysis.timeComplexity?.slice(aiAnalysis.timeComplexity.indexOf(' ') + 1)}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Space Complexity</p>
                    <p className="text-blue-400 font-mono font-bold text-sm">{aiAnalysis.spaceComplexity?.split(' ')[0]}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-tight">{aiAnalysis.spaceComplexity?.slice(aiAnalysis.spaceComplexity.indexOf(' ') + 1)}</p>
                  </div>
                </div>
                {aiAnalysis.potentialBugs?.length > 0 && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">⚠ Potential Bugs</p>
                    <ul className="space-y-1">{aiAnalysis.potentialBugs.map((b, i) => <li key={i} className="text-xs text-slate-300">· {b}</li>)}</ul>
                  </div>
                )}
                {aiAnalysis.edgeCases?.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">Edge Cases</p>
                    <ul className="space-y-1">{aiAnalysis.edgeCases.map((ec, i) => <li key={i} className="text-xs text-slate-300">· {ec}</li>)}</ul>
                  </div>
                )}
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Alternative Approach</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.alternativeApproach}</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Code Quality</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.codeQuality}</p>
                </div>
                {/* Overall Evaluation */}
                {aiAnalysis.overallEvaluation && (
                  <div className={`border rounded-xl p-4 ${aiAnalysis.overallEvaluation.recommendation === 'Recommended' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Overall Evaluation</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${aiAnalysis.overallEvaluation.recommendation === 'Recommended' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-amber-400 bg-amber-400/10 border-amber-400/30'}`}>
                        {aiAnalysis.overallEvaluation.recommendation}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className={star <= aiAnalysis.overallEvaluation.rating ? 'text-amber-400' : 'text-slate-600'}>★</span>
                      ))}
                      <span className="text-xs text-slate-400 ml-1">{aiAnalysis.overallEvaluation.rating}/5</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Problem Solving</span><span className="text-slate-300">{aiAnalysis.overallEvaluation.problemSolving}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Algorithm</span><span className="text-slate-300">{aiAnalysis.overallEvaluation.algorithmChoice}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Code Quality</span><span className="text-slate-300">{aiAnalysis.overallEvaluation.codeQuality}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === 'Chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-slate-600 text-sm text-center mt-8">No messages yet.</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === role ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.sender === role ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t border-slate-700/80 flex gap-2 shrink-0">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg text-sm transition font-medium">Send</button>
          </form>
        </div>
      )}

      {/* ── NOTES TAB ── */}
      {activeTab === 'Notes' && role === 'interviewer' && (
        <div className="flex-1 flex flex-col min-h-0 p-4 gap-3">
          <p className="text-xs text-slate-500">Private notes — not visible to the candidate.</p>
          <div className="flex flex-wrap gap-2 mb-1">
            {['Good Communication', 'Missed Edge Cases', 'Strong Problem Solving', 'Recommended for Next Round', 'Needs Improvement'].map(tag => (
              <button key={tag} type="button" onClick={() => setNotes(prev => prev ? prev + '\n' + tag : tag)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition">
                + {tag}
              </button>
            ))}
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Your private interview notes here..."
            className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition resize-none leading-relaxed" />
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
