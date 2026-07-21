import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const LANG_LABELS = { javascript: 'JavaScript', python: 'Python', cpp: 'C++', java: 'Java' };

const CodeEditor = ({ socket, sessionId, currentCode, onCodeChange, language, onLanguageChange }) => {
  const editorRef = useRef(null);
  const isUpdatingFromSocket = useRef(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('code-change', (newCode) => {
      isUpdatingFromSocket.current = true;
      onCodeChange(newCode);
    });

    socket.on('language-change', (newLang) => {
      onLanguageChange(newLang);
    });

    return () => {
      socket.off('code-change');
      socket.off('language-change');
    };
  }, [socket, onCodeChange, onLanguageChange]);

  const handleEditorChange = (value) => {
    if (!isUpdatingFromSocket.current) {
      onCodeChange(value);
      socket?.emit('code-change', { sessionId, code: value });
    }
    isUpdatingFromSocket.current = false;
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    onLanguageChange(newLang);
    socket?.emit('language-change', { sessionId, language: newLang });
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Editor Toolbar */}
      <div className="h-10 shrink-0 border-b border-slate-700/80 flex items-center px-4 bg-[#252526] gap-3">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Sync
        </div>
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-transparent text-slate-300 text-xs outline-none border-none cursor-pointer hover:text-white transition"
        >
          {Object.entries(LANG_LABELS).map(([val, label]) => (
            <option key={val} value={val} className="bg-slate-800">{label}</option>
          ))}
        </select>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={currentCode}
          onChange={handleEditorChange}
          onMount={(editor) => { editorRef.current = editor; }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            renderLineHighlight: 'line',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
