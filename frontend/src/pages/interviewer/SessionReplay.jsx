import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const SPEEDS = [0.5, 1, 2, 4];

const SessionReplay = () => {
  const { roomId } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [replayCode, setReplayCode] = useState('');
  const [replayChatLog, setReplayChatLog] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/sessions/${roomId}/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [roomId, token]);

  const applyEvent = (event) => {
    if (event.eventType === 'CODE_CHANGE') setReplayCode(event.data);
    if (event.eventType === 'CHAT_MESSAGE') setReplayChatLog(prev => [...prev, event.data]);
  };

  const play = () => {
    if (currentIndex >= events.length) {
      setCurrentIndex(0);
      setReplayCode('');
      setReplayChatLog([]);
    }
    setPlaying(true);
  };

  const pause = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };

  const restart = () => {
    pause();
    setCurrentIndex(0);
    setReplayCode('');
    setReplayChatLog([]);
  };

  useEffect(() => {
    if (!playing) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= events.length) { setPlaying(false); return prev; }
        applyEvent(events[prev]);
        return prev + 1;
      });
    }, 500 / speed);
    return () => clearInterval(intervalRef.current);
  }, [playing, speed, events]);

  const progress = events.length ? Math.round((currentIndex / events.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <p className="text-slate-400 animate-pulse">Loading session events...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-slate-700/80 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/interviewer/summary/${roomId}`)} className="text-slate-500 hover:text-slate-300 text-sm transition">← Summary</button>
          <span className="text-xl font-bold text-white">Session Replay</span>
          <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">{events.length} events</span>
        </div>
        <p className="text-xs font-mono text-slate-500">{roomId}</p>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Code Replay Panel */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] border-r border-slate-700/80 overflow-hidden">
          <div className="px-4 py-2 bg-[#252526] border-b border-slate-700/80 text-xs text-slate-500">Code at event #{currentIndex}</div>
          <pre className="flex-1 overflow-auto p-5 font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {replayCode || '// Replay will display code changes here...'}
          </pre>
        </div>

        {/* Chat Log */}
        <div className="w-72 flex flex-col bg-[#161b22] overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/80 text-xs text-slate-400 font-semibold">Chat Log</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {replayChatLog.length === 0 ? (
              <p className="text-slate-600 text-xs text-center mt-8">Chat messages will appear here during replay.</p>
            ) : (
              replayChatLog.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'interviewer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${msg.sender === 'interviewer' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                    <p>{msg.text}</p>
                    <p className="opacity-50 mt-0.5">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="shrink-0 bg-[#161b22] border-t border-slate-700/80 px-8 py-4">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 cursor-pointer" onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          const idx = Math.floor(pct * events.length);
          setCurrentIndex(idx);
          // Rebuild state up to idx
          const code = events.slice(0, idx).filter(e => e.eventType === 'CODE_CHANGE').slice(-1)[0]?.data || '';
          const chats = events.slice(0, idx).filter(e => e.eventType === 'CHAT_MESSAGE').map(e => e.data);
          setReplayCode(code);
          setReplayChatLog(chats);
        }}>
          <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">{currentIndex} / {events.length} events</div>
          <div className="flex items-center gap-3">
            <button onClick={restart} className="text-slate-400 hover:text-white transition text-sm font-mono">↺ Restart</button>
            <button onClick={playing ? pause : play}
              className="bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg transition">
              {playing ? '⏸' : '▶'}
            </button>
            <div className="flex items-center gap-1">
              {SPEEDS.map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`text-xs px-2 py-1 rounded transition ${speed === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {s}×
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500">{events.length > 0 ? `${Math.round((currentIndex / events.length) * 100)}%` : '—'}</div>
        </div>
      </div>
    </div>
  );
};

export default SessionReplay;
