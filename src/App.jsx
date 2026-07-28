import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileSetup from './pages/ProfileSetup'; 
import UserProfile from './pages/UserProfile'; 
import Dashboard from './pages/Dashboard';   
import AdminDashboard from './pages/AdminDashboard'; 
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

// ==========================================
// CITIZEN ROUTE GUARD
// ==========================================
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ==========================================
// SECURE ADMIN ROUTE GUARD
// ==========================================
// This strictly checks for an adminToken. Regular citizens cannot bypass this.
const AdminProtectedRoute = ({ children }) => {
  const adminToken = !!localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#060D1E] flex flex-col font-sans">
        <main className="flex-grow">
          <Routes>
            {/* Default route redirects to citizen login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* ========================================== */}
            {/* PUBLIC CITIZEN AUTH ROUTES                 */}
            {/* ========================================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* ========================================== */}
            {/* PROTECTED CITIZEN ROUTES                   */}
            {/* ========================================== */}
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            /> 
            
            {/* ========================================== */}
            {/* STRICTLY SECURE ADMIN ROUTES               */}
            {/* ========================================== */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } 
            />

            {/* Redirect /admin directly to the secure dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                       
            {/* Catch-all route defaults to citizen login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;