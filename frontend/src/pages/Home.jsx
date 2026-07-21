import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 font-medium mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Next-Generation Interview Platform
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">top 1%</span> of engineers, in real-time.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
          Experience seamless collaborative coding with instant execution, integrated system design, and AI-driven insights—all in your browser.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12 pt-8">
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-white text-black hover:bg-slate-200 transition-all rounded-xl font-semibold overflow-hidden"
          >
            <span className="relative z-10">Start Interviewing</span>
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white rounded-xl font-semibold backdrop-blur-md"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
