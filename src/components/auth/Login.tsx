import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LoginProps {
  userType?: 'student' | 'parent';
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export default function Login({ userType = 'student', onRegisterClick, onForgotPasswordClick }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <div className="text-red-500">{error}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onRegisterClick}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Register
              </button>
            </p>
            <p className="text-sm text-gray-600">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
