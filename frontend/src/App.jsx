import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Workspace from './pages/Workspace';
import InterviewerDashboard from './pages/interviewer/Dashboard';
import CandidateDashboard from './pages/candidate/Dashboard';
import QuestionBank from './pages/interviewer/QuestionBank';
import InterviewSummary from './pages/interviewer/InterviewSummary';
import SessionReplay from './pages/interviewer/SessionReplay';
import CompletionPage from './pages/candidate/CompletionPage';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={user?.role === 'interviewer' ? '/interviewer/dashboard' : '/candidate/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Interviewer routes */}
          <Route path="/interviewer/dashboard" element={
            <ProtectedRoute allowedRole="interviewer"><InterviewerDashboard /></ProtectedRoute>
          } />
          <Route path="/interviewer/questions" element={
            <ProtectedRoute allowedRole="interviewer"><QuestionBank /></ProtectedRoute>
          } />
          <Route path="/interviewer/summary/:roomId" element={
            <ProtectedRoute allowedRole="interviewer"><InterviewSummary /></ProtectedRoute>
          } />
          <Route path="/interviewer/replay/:roomId" element={
            <ProtectedRoute allowedRole="interviewer"><SessionReplay /></ProtectedRoute>
          } />

          {/* Candidate routes */}
          <Route path="/candidate/dashboard" element={
            <ProtectedRoute allowedRole="candidate"><CandidateDashboard /></ProtectedRoute>
          } />
          <Route path="/candidate/completion/:roomId" element={
            <ProtectedRoute allowedRole="candidate"><CompletionPage /></ProtectedRoute>
          } />

          {/* Shared workspace */}
          <Route path="/workspace/:sessionId" element={
            <ProtectedRoute><Workspace /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
