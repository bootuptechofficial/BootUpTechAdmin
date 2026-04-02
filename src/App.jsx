import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import useWebSocket from './hooks/useWebSocket';

// Layout & Auth
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';

// Pages
import DashboardPage from './pages/DashboardPage';
import PostsPage from './pages/PostsPage';
import EditPostPage from './pages/EditPostPage';
import CreatePostPage from './pages/CreatePostPage';
import DownloadsPage from './pages/DownloadsPage';
import AdsPage from './pages/AdsPage';
import SettingsPage from './pages/SettingsPage';
import PaymentsPage from './pages/PaymentsPage';
import MenusPage from './pages/MenusPage';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Setup WebSocket listeners for real-time updates
  useWebSocket({
    'post:created': () => setRefreshTrigger(t => t + 1),
    'post:updated': () => setRefreshTrigger(t => t + 1),
    'post:deleted': () => setRefreshTrigger(t => t + 1),
    'menu:created': () => setRefreshTrigger(t => t + 1),
    'menu:updated': () => setRefreshTrigger(t => t + 1),
    'menu:deleted': () => setRefreshTrigger(t => t + 1),
    'menu:reordered': () => setRefreshTrigger(t => t + 1),
    'download:created': () => setRefreshTrigger(t => t + 1),
    'download:updated': () => setRefreshTrigger(t => t + 1),
    'download:deleted': () => setRefreshTrigger(t => t + 1),
    'ad:created': () => setRefreshTrigger(t => t + 1),
    'ad:updated': () => setRefreshTrigger(t => t + 1),
    'ad:deleted': () => setRefreshTrigger(t => t + 1),
    'settings:updated': (payload) => { setRefreshTrigger(t => t + 1); toast.success('Settings were updated'); },
    'payments:updated': (payload) => { setRefreshTrigger(t => t + 1); toast.success('Payment settings were updated'); }
    ,
    'settings:updated': () => setRefreshTrigger(t => t + 1),
    'payments:updated': () => setRefreshTrigger(t => t + 1)
  });

  return (
    <AuthProvider>
      <BrowserRouter basename="/admin">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f8fafc' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<AdminLayout refreshTrigger={refreshTrigger} />}>
            <Route index element={<DashboardPage key={refreshTrigger} />} />
            
            <Route path="posts" element={<PostsPage key={refreshTrigger} />} />
            <Route path="posts/new" element={<CreatePostPage key={refreshTrigger} />} />
            <Route path="posts/edit/:id" element={<EditPostPage key={refreshTrigger} />} />
            
            <Route path="downloads" element={<DownloadsPage key={refreshTrigger} />} />
            <Route path="ads" element={<AdsPage key={refreshTrigger} />} />
            <Route path="settings" element={<SettingsPage key={refreshTrigger} />} />
            <Route path="payments" element={<PaymentsPage key={refreshTrigger} />} />
            <Route path="menus" element={<MenusPage key={refreshTrigger} />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
