import React, { useState, useEffect, useRef } from 'react';

const TABS = ['Terminal', 'Visible Tests', 'Hidden Tests', 'History'];

const ExecutionPanel = ({ output, visibleTestCases = [], hiddenResults = null, executionHistory = [], isRunning, role }) => {
  const [activeTab, setActiveTab] = useState('Terminal');

  const tabs = role === 'interviewer' ? TABS : ['Terminal', 'Visible Tests', 'Hidden Tests'];

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-t border-slate-700/80">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[#161b22] border-b border-slate-700/80 shrink-0">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded text-xs font-medium transition ${activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Terminal Tab */}
      {activeTab === 'Terminal' && (
        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
          {isRunning ? (
            <span className="text-yellow-400 animate-pulse">⟳ Running code...</span>
          ) : output ? (
            <pre className={`whitespace-pre-wrap leading-relaxed ${output.toLowerCase().includes('error') ? 'text-red-400' : 'text-emerald-300'}`}>{output}</pre>
          ) : (
            <span className="text-slate-600">Run your code to see output here...</span>
          )}
        </div>
      )}

      {/* Visible Tests Tab */}
      {activeTab === 'Visible Tests' && (
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {visibleTestCases.length === 0 ? (
            <p className="text-slate-500 text-sm">No visible test cases for this question.</p>
          ) : (
            visibleTestCases.map((tc, i) => (
              <div key={i} className={`border rounded-lg p-3 text-sm ${tc.passed === true ? 'border-emerald-500/40 bg-emerald-500/5' : tc.passed === false ? 'border-red-500/40 bg-red-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-300">Test Case #{i + 1}</span>
                  {tc.passed === true && <span className="text-xs text-emerald-400 font-bold">✓ PASS</span>}
                  {tc.passed === false && <span className="text-xs text-red-400 font-bold">✗ FAIL</span>}
                </div>
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <p className="text-slate-500 mb-1">Input</p>
                    <p className="text-slate-300 bg-slate-900/80 p-2 rounded">{tc.input || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Expected</p>
                    <p className="text-slate-300 bg-slate-900/80 p-2 rounded">{tc.expectedOutput || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Actual</p>
                    <p className={`bg-slate-900/80 p-2 rounded ${tc.actualOutput !== undefined ? (tc.passed ? 'text-emerald-400' : 'text-red-400') : 'text-slate-600'}`}>
                      {tc.actualOutput !== undefined ? tc.actualOutput : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Hidden Tests Tab */}
      {activeTab === 'Hidden Tests' && (
        <div className="flex-1 overflow-auto p-4 flex items-start">
          {hiddenResults ? (
            <div className="w-full space-y-3">
              <div className={`text-center py-6 rounded-xl border ${hiddenResults.passed === hiddenResults.total ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}>
                <p className={`text-4xl font-bold ${hiddenResults.passed === hiddenResults.total ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {hiddenResults.passed}/{hiddenResults.total}
                </p>
                <p className="text-slate-400 text-sm mt-1">Hidden Test Cases Passed</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Submit code to run hidden test cases.</p>
          )}
        </div>
      )}

      {/* History Tab (Interviewer Only) */}
      {activeTab === 'History' && role === 'interviewer' && (
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {executionHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No code runs yet in this session.</p>
          ) : (
            executionHistory.map((run, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/40 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm">
                <span className="text-slate-400 font-mono">Run #{i + 1}</span>
                <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                  run.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                  run.status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>{run.status === 'success' ? `Passed ${run.passedVisible}/${run.totalVisible}` : run.status}</span>
                <span className="text-slate-600 text-xs">{new Date(run.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionPanel;
