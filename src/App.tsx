import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/auth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to EduConnect</h1>
            <div className="max-w-md w-full space-y-4">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                Get Started
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
