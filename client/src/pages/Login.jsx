import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
  <div className="min-h-screen bg-ink flex items-center justify-center px-4">
    <div className="w-full max-w-sm bg-surface border border-line rounded-lg p-8 relative">
      <p className="font-mono text-xs tracking-widest text-text-muted uppercase mb-3">
        Sign-in slip · No. 001
      </p>
      <h1 className="font-display text-3xl font-semibold text-text mb-1">Smart Split</h1>
      <p className="text-sm text-text-muted mb-6">Log in to settle up with your group.</p>

      <div className="relative -mx-8 mb-6">
        <div className="border-t border-dashed border-line"></div>
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-ink"></div>
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-ink"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-text-muted mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-2 border border-line rounded-md px-3 py-2 text-text placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {error && <p className="font-mono text-xs text-danger">! {error}</p>}

        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-soft text-ink font-display font-semibold py-2.5 rounded-md transition-colors mt-2"
        >
          Log In
        </button>
      </form>
    </div>
  </div>
);
}

export default Login;