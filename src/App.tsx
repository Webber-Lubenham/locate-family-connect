
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentMap from './pages/StudentMap';
import TestUsers from './pages/TestUsers'; // Add import for TestUsers

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/student-map/:id" element={<StudentMap />} />
          <Route path="/test-users" element={<TestUsers />} /> {/* Add new route */}
        </Routes>
      </Router>
      <Toaster />
    </UserProvider>
  );
}

export default App;
