import React from 'react';

const DIFFICULTY_COLORS = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const QuestionPanel = ({ question, role, onChangeQuestion }) => {
  if (!question) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-[#0d1117] border-r border-slate-700/80 text-center">
        <p className="text-4xl mb-3">📄</p>
        <p className="text-slate-400 font-medium text-sm">No question loaded</p>
        {role === 'interviewer' && (
          <button onClick={onChangeQuestion}
            className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition font-medium">
            Pick a Question
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-r border-slate-700/80 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/80 bg-[#161b22] shrink-0">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-white text-sm leading-tight">{question.title}</h2>
          {role === 'interviewer' && (
            <button onClick={onChangeQuestion}
              className="shrink-0 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded transition">
              Change
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.Medium}`}>
            {question.difficulty}
          </span>
          {question.tags?.map((tag, i) => (
            <span key={i} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
        {question.companies?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {question.companies.map((c, i) => (
              <span key={i} className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-1.5 py-0.5 rounded">{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm text-slate-300 leading-relaxed">
        <p className="whitespace-pre-wrap text-xs leading-relaxed">{question.description}</p>

        {/* Constraints */}
        {question.constraints && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Constraints</h3>
            <p className="text-xs text-slate-400 bg-[#161b22] border border-slate-700/60 rounded-lg p-3 font-mono">{question.constraints}</p>
          </div>
        )}

        {/* Examples */}
        {question.visibleTestCases?.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Examples</h3>
            {question.visibleTestCases.slice(0, 2).map((tc, i) => (
              <div key={i} className="bg-[#161b22] border border-slate-700/60 rounded-lg p-3 font-mono text-xs space-y-1">
                <p><span className="text-slate-500">Input:</span> <span className="text-slate-200">{tc.input}</span></p>
                <p><span className="text-slate-500">Output:</span> <span className="text-slate-200">{tc.expectedOutput}</span></p>
              </div>
            ))}
          </div>
        )}

        {/* Hints */}
        {question.hints?.length > 0 && (
          <details className="group">
            <summary className="text-xs font-bold text-amber-400 cursor-pointer list-none flex items-center gap-1 hover:text-amber-300 transition">
              <span className="group-open:rotate-90 transition-transform">▶</span> Hints ({question.hints.length})
            </summary>
            <div className="mt-2 space-y-1.5">
              {question.hints.map((h, i) => (
                <p key={i} className="text-xs text-slate-400 bg-amber-400/5 border border-amber-400/15 rounded p-2">💡 {h}</p>
              ))}
            </div>
          </details>
        )}

        {/* Starter Code */}
        {(question.starterCode?.javascript || typeof question.starterCode === 'string') && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Starter Code</h3>
            <pre className="bg-[#161b22] border border-slate-700/60 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
              {typeof question.starterCode === 'string' ? question.starterCode : question.starterCode.javascript}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
