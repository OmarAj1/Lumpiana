import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AuthView, User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: AuthView;
  onAuthSuccess?: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView, onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (view === 'signIn') {
        user = await authService.signIn(email, password);
      } else {
        user = await authService.signUp(email, password, name, tag);
      }
      if (onAuthSuccess) onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-primary border border-border-default rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header - Left Aligned */}
        <div className="p-8 pb-0 text-left">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            {view === 'signIn' ? 'Welcome Back' : 'Join Luma'}
          </h2>
          <p className="text-text-secondary text-sm">
            {view === 'signIn' ? 'Sign in to continue your journey' : 'Create an account to track your progress'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {view === 'signUp' && (
             <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-default rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Tag (@handle)</label>
                <input 
                  type="text" 
                  value={tag} onChange={e => setTag(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="w-full bg-surface-secondary border border-border-default rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="pianist_pro"
                  required
                />
              </div>
             </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
                {view === 'signIn' ? 'Email or Tag' : 'Email'}
            </label>
            <input 
              type="text" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-secondary border border-border-default rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
              placeholder={view === 'signIn' ? "user@example.com or @tag" : "user@example.com"}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Password</label>
            <input 
              type="password" 
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-secondary border border-border-default rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Processing...' : (view === 'signIn' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Footer - Left Aligned */}
        <div className="bg-surface-secondary/50 p-4 text-left border-t border-border-default">
          <p className="text-sm text-text-secondary">
            {view === 'signIn' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setView(view === 'signIn' ? 'signUp' : 'signIn'); setError(''); }}
              className="text-blue-400 font-bold hover:underline"
            >
              {view === 'signIn' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;