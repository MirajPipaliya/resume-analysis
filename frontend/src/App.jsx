import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from './store/authStore';

// Layout
import PageWrapper from './components/layout/PageWrapper';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Candidates from './pages/Candidates';
import ResumeUpload from './pages/ResumeUpload';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import CoverLetter from './pages/CoverLetter';
import InterviewPrep from './pages/InterviewPrep';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  if (user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  const [init, setInit] = useState(false);

  useEffect(() => {
    initAuth();
    setInit(true);
  }, [initAuth]);

  if (!init) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <PageWrapper />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="history" element={<Candidates />} />
          <Route path="upload" element={<ResumeUpload />} />
          <Route path="cover-letter" element={<CoverLetter />} />
          <Route path="interview-prep" element={<InterviewPrep />} />
          <Route path="analysis/:id" element={<Analysis />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
