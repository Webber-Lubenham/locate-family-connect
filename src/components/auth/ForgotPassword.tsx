import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ForgotPasswordProps {
  userType?: 'student' | 'parent';
  onBackToLogin?: () => void;
}

export default function ForgotPassword({ userType = 'student', onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}
          {message && (
            <div className="text-green-500 text-center">{message}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Send Reset Link
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
