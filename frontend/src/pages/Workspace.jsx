import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import CodeEditor from '../components/CodeEditor';
import QuestionPanel from '../components/QuestionPanel';
import ControlPanel from '../components/ControlPanel';
import ExecutionPanel from '../components/ExecutionPanel';
import QuestionPickerModal from '../components/QuestionPickerModal';

const DEFAULT_CODE = {
  javascript: '// Write your solution here\nfunction solution() {\n  \n}\n',
  python: '# Write your solution here\ndef solution():\n    pass\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  \n  return 0;\n}\n',
  java: 'public class Solution {\n  public static void main(String[] args) {\n    \n  }\n}\n',
};

const Timer = ({ durationMinutes }) => {
  const [seconds, setSeconds] = useState(durationMinutes * 60);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [paused, seconds]);
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  const urgent = seconds < 300;
  const warning = seconds < 900 && seconds >= 300;
  
  let colorClass = 'text-emerald-400';
  if (urgent) colorClass = 'text-red-400 animate-pulse';
  else if (warning) colorClass = 'text-amber-400';

  return (
    <div className="flex items-center gap-2">
      <span className={`font-mono text-sm font-bold ${colorClass}`}>
        {h}:{m}:{s}
      </span>
      <button onClick={() => setPaused(p => !p)} className="text-slate-500 hover:text-slate-300 text-xs transition">
        {paused ? '▶' : '⏸'}
      </button>
    </div>
  );
};

const Workspace = () => {
  const { sessionId } = useParams();
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || 'candidate';

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE['javascript']);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [visibleTestCases, setVisibleTestCases] = useState([]);
  const [hiddenResults, setHiddenResults] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [question, setQuestion] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState({ name: '—', status: 'Waiting...', language: 'javascript', executions: 0, lastActivity: null, typing: false });
  const [duration, setDuration] = useState(60);
  const [interviewId, setInterviewId] = useState(null);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const typingTimer = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);
    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.emit('join-session', { sessionId, user });
    newSocket.on('output-change', (data) => setOutput(data));
    newSocket.on('candidate-status', (status) => setCandidateInfo(prev => ({ ...prev, status })));
    newSocket.on('candidate-language', (lang) => setCandidateInfo(prev => ({ ...prev, language: lang })));
    newSocket.on('question-changed', (newQuestion) => {
      setQuestion(newQuestion);
      if (newQuestion?.visibleTestCases) setVisibleTestCases(newQuestion.visibleTestCases);
      const starterCode = newQuestion?.starterCode?.[language] || DEFAULT_CODE[language];
      setCurrentCode(starterCode);
    });
    newSocket.on('user-joined', (joinedUser) => {
      if (joinedUser?.role === 'candidate') {
        setCandidateInfo(prev => ({ ...prev, name: joinedUser.name, status: 'Online', lastActivity: new Date().toISOString() }));
      }
    });
    return () => newSocket.disconnect();
  }, [sessionId, user]);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/interviews/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data._id) setInterviewId(res.data._id);
        if (res.data.questionId) setQuestion(res.data.questionId);
        if (res.data.duration) setDuration(res.data.duration);
        if (res.data.language) {
          setLanguage(res.data.language);
          const starterCode = res.data.questionId?.starterCode?.[res.data.language] || DEFAULT_CODE[res.data.language];
          setCurrentCode(starterCode || DEFAULT_CODE['javascript']);
        }
        if (res.data.questionId?.visibleTestCases) {
          setVisibleTestCases(res.data.questionId.visibleTestCases);
        }
      } catch (e) { /* No interview found for this room yet */ }
    };
    if (token) fetchInterview();
  }, [sessionId, token]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => saveDraft(true), 30000);
    return () => clearInterval(autoSave);
  }, [currentCode, language]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter -> Run Code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      // Ctrl+S or Cmd+S -> Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCode, language, interviewId]);

  const handleCodeChange = useCallback((val) => {
    setCurrentCode(val);
    // Broadcast typing status
    socket?.emit('candidate-status', { sessionId, status: 'Typing...' });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit('candidate-status', { sessionId, status: 'Online' });
    }, 2000);
  }, [socket, sessionId]);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    const starterCode = question?.starterCode?.[lang] || DEFAULT_CODE[lang] || '';
    setCurrentCode(starterCode);
    socket?.emit('candidate-language', { sessionId, language: lang });
  }, [socket, sessionId, question]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    socket?.emit('candidate-status', { sessionId, status: 'Running Code...' });
    setCandidateInfo(prev => ({ ...prev, executions: prev.executions + 1, lastActivity: new Date().toISOString() }));
    try {
      const res = await axios.post('http://localhost:5001/api/execute', {
        language,
        code: currentCode,
        testCases: visibleTestCases
      });
      const result = res.data.run?.output || res.data.compile?.output || 'No output.';
      setOutput(result);
      socket?.emit('output-change', { sessionId, output: result });

      // Split output lines if multiple outputs were generated for test cases
      const outputLines = result.split('\n').map(l => l.trim()).filter(Boolean);

      const updatedTCs = visibleTestCases.map((tc, idx) => {
        const actual = outputLines[idx] !== undefined ? outputLines[idx] : result.trim();
        const expected = tc.expectedOutput?.trim();
        const passed = actual === expected || result.trim() === expected;
        return { ...tc, actualOutput: actual, passed };
      });
      setVisibleTestCases(updatedTCs);

      const passedCount = updatedTCs.filter(t => t.passed).length;
      setExecutionHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        status: 'success',
        passedVisible: passedCount,
        totalVisible: updatedTCs.length,
      }]);
    } catch (err) {
      console.error('Execution Call Failed:', err);
      const errMsg = err.response?.data?.message || 'Error connecting to execution server.';
      setOutput(errMsg);
      setExecutionHistory(prev => [...prev, { timestamp: new Date().toISOString(), status: 'error' }]);
    } finally {
      setIsRunning(false);
      socket?.emit('candidate-status', { sessionId, status: 'Online' });
    }
  };

  const runHiddenTests = async () => {
    if (!question?.hiddenTestCases?.length) { alert('No hidden test cases for this question.'); return; }
    setIsRunning(true);
    try {
      const res = await axios.post('http://localhost:5001/api/execute', {
        language,
        code: currentCode,
        testCases: question.hiddenTestCases
      });
      const result = res.data.run?.output?.trim() || '';
      const outputLines = result.split('\n').map(l => l.trim()).filter(Boolean);

      const passed = question.hiddenTestCases.filter((tc, idx) => {
        const actual = outputLines[idx] !== undefined ? outputLines[idx] : result;
        return actual === tc.expectedOutput?.trim() || result === tc.expectedOutput?.trim();
      }).length;

      setHiddenResults({ passed, total: question.hiddenTestCases.length });
      setExecutionHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        status: 'hidden',
        passedHidden: passed,
        totalHidden: question.hiddenTestCases.length,
      }]);
    } catch (e) { alert('Failed to run hidden tests.'); }
    finally { setIsRunning(false); }
  };

  const saveDraft = async (silent = false) => {
    if (!interviewId || !user) return;
    try {
      await axios.post('http://localhost:5001/api/sessions/save-draft', {
        interviewId, candidateId: user.id, language, code: currentCode,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (!silent) setSavedDraft(true);
      setTimeout(() => setSavedDraft(false), 2000);
    } catch (e) { console.error('Draft save failed', e); }
  };

  const handleQuestionSelect = async (selectedQuestion) => {
    setShowQuestionPicker(false);
    setQuestion(selectedQuestion);
    if (selectedQuestion?.visibleTestCases) setVisibleTestCases(selectedQuestion.visibleTestCases);
    const starterCode = selectedQuestion?.starterCode?.[language] || DEFAULT_CODE[language];
    setCurrentCode(starterCode);
    // Broadcast to candidate via socket
    socket?.emit('question-changed', { sessionId, question: selectedQuestion });
    // Persist to interview record in DB
    if (interviewId) {
      try {
        await axios.put(`http://localhost:5001/api/interviews/${interviewId}`, { questionId: selectedQuestion._id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) { console.error('Failed to save question to interview', e); }
    }
  };

  const confirmSubmit = async () => {
    setIsRunning(true);
    await saveDraft(true);
    
    // Calculate metrics
    const runs = executionHistory.length;
    const lastRun = executionHistory[executionHistory.length - 1];
    const passedTests = lastRun?.passedVisible || 0;
    const totalTests = lastRun?.totalVisible || visibleTestCases.length;
    const durationSpent = (duration * 60) - 0; // Simplified for now, real timer diff needed ideally
    
    try {
      await axios.post(`http://localhost:5001/api/sessions/${sessionId}/submit`, {
        interviewId,
        runs,
        passedTests,
        totalTests,
        code: currentCode,
        language,
        durationSpent
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      socket?.emit('interview-end', { sessionId });
      navigate(`/candidate/completion/${sessionId}`, { state: { runs, passedTests, totalTests, durationSpent } });
    } catch (e) {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsRunning(false);
      setShowSubmitConfirm(false);
    }
  };

  const finishInterview = async () => {
    if (role === 'interviewer') {
      if (!window.confirm('Are you sure you want to finish this interview?')) return;
      await saveDraft(true);
      socket?.emit('interview-end', { sessionId });
      navigate(`/interviewer/summary/${sessionId}`);
    } else {
      setShowSubmitConfirm(true); // Open submit dialog for candidate
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-slate-200 overflow-hidden">
      {/* ── Navbar ── */}
      <header className="h-12 shrink-0 bg-[#161b22] border-b border-slate-700/80 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-emerald-400 text-base">IntervueX</span>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`} />
            <span className="text-xs text-slate-500">{connected ? 'Connected' : 'Reconnecting...'}</span>
          </div>
          {role === 'interviewer' && (
            <>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${candidateInfo.status === 'Online' ? 'bg-emerald-400' : candidateInfo.status === 'Typing...' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400 animate-pulse'}`} />
                {candidateInfo.name !== '—' ? `${candidateInfo.name} · ` : ''}{candidateInfo.status}
              </div>
            </>
          )}
          {savedDraft && <span className="text-xs text-emerald-400 animate-in fade-in duration-200">✓ Saved</span>}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Timer durationMinutes={duration} />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={runCode} disabled={isRunning}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition">
            {isRunning ? '⟳ Running...' : '▶ Run'}
          </button>
          {role === 'interviewer' && (
            <>
              <button onClick={runHiddenTests} disabled={isRunning}
                className="text-xs bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/60 text-purple-300 px-3 py-1.5 rounded-lg transition font-medium">
                Run Hidden Tests
              </button>
              <button onClick={() => saveDraft(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition">
                {savedDraft ? '✓ Saved' : 'Save Draft'}
              </button>
              <button onClick={finishInterview}
                className="text-xs bg-red-900/70 hover:bg-red-800 border border-red-800/60 text-red-300 px-3 py-1.5 rounded-lg transition font-semibold">
                Finish Interview
              </button>
            </>
          )}
          {role === 'candidate' && (
            <>
              <button onClick={() => saveDraft(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition">
                {savedDraft ? '✓ Saved' : 'Save Draft'}
              </button>
              <button onClick={finishInterview}
                className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg transition font-semibold">
                Submit Solution
              </button>
            </>
          )}
          <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-slate-500 hover:text-slate-300 px-2 transition">Leave</button>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[280px] shrink-0 flex flex-col overflow-hidden">
          <QuestionPanel question={question} role={role} onChangeQuestion={() => setShowQuestionPicker(true)} />
        </div>

        <div className="flex-1 flex flex-col min-w-0 border-x border-slate-700/80">
          <div className="flex-[65] min-h-0">
            <CodeEditor socket={socket} sessionId={sessionId} currentCode={currentCode} onCodeChange={handleCodeChange} language={language} onLanguageChange={handleLanguageChange} />
          </div>
          <div className="flex-[35] min-h-0">
            <ExecutionPanel output={output} visibleTestCases={visibleTestCases} hiddenResults={hiddenResults} executionHistory={executionHistory} isRunning={isRunning} role={role} />
          </div>
        </div>

        {role === 'interviewer' && (
          <div className="w-[280px] shrink-0 flex flex-col overflow-hidden">
            <ControlPanel code={currentCode} socket={socket} sessionId={sessionId} role={role} candidateInfo={candidateInfo} language={language} />
          </div>
        )}
      </div>

      {/* Question Picker Modal */}
      {showQuestionPicker && (
        <QuestionPickerModal
          onSelect={handleQuestionSelect}
          onClose={() => setShowQuestionPicker(false)}
        />
      )}

      {/* Submit Confirmation Modal (Candidate) */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161b22] border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Submission</h3>
            <p className="text-sm text-slate-400 mb-6">You won't be able to edit your code after submission.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-lg font-medium transition text-sm">
                Cancel
              </button>
              <button onClick={confirmSubmit} disabled={isRunning}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2.5 rounded-lg font-semibold transition text-sm">
                {isRunning ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
