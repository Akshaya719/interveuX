import React, { useState } from 'react';
import axios from 'axios';

const AiAssistant = ({ code }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/ai/analyze', { code });
      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-800 border-l border-slate-700">
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-blue-400">✨</span> AI Interview Assistant
        </h2>
        <button 
          onClick={handleAnalyze}
          disabled={loading || !code}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs px-3 py-1.5 rounded transition-colors font-medium shadow-sm"
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 text-sm space-y-6">
        {!analysis && !loading && (
          <div className="text-slate-500 text-center mt-10">
            Click "Analyze Code" to get structured insights on the candidate's current code.
          </div>
        )}

        {loading && (
          <div className="text-blue-400 text-center mt-10 animate-pulse">
            Analyzing code structure and complexity...
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Time Complexity</h3>
              <p className="text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">{analysis.timeComplexity}</p>
            </div>
            
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Space Complexity</h3>
              <p className="text-blue-400 bg-blue-400/10 p-3 rounded-lg border border-blue-400/20">{analysis.spaceComplexity}</p>
            </div>
            
            {analysis.potentialBugs?.length > 0 && (
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Potential Bugs</h3>
                <ul className="list-disc list-inside text-red-300 bg-red-400/10 p-3 rounded-lg border border-red-400/20 space-y-1">
                  {analysis.potentialBugs.map((bug, i) => (
                    <li key={i}>{bug}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.edgeCases?.length > 0 && (
              <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Edge Cases</h3>
                <ul className="list-disc list-inside text-amber-300 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20 space-y-1">
                  {analysis.edgeCases.map((ec, i) => (
                    <li key={i}>{ec}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Alternative Approach</h3>
              <p className="text-slate-300 bg-slate-700/50 p-3 rounded-lg border border-slate-600">{analysis.alternativeApproach}</p>
            </div>

            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Code Quality</h3>
              <p className="text-slate-300 bg-slate-700/50 p-3 rounded-lg border border-slate-600">{analysis.codeQuality}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
