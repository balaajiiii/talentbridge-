import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      showToast('error', error.message);
    } else {
      showToast('success', 'Welcome back!');
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent-50/40 to-ink-50" />

      <div className="w-full max-w-md fade-up">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-600 text-white shadow-lg shadow-accent-600/30">
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
              TalentBridge
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white/80 p-8 shadow-float backdrop-blur-xl">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-500">Login to your account to continue</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button type="submit" fullWidth size="lg" disabled={loading} className="group">
              {loading ? 'Signing in...' : 'Login'}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-ink-400">
            <Mail className="h-4 w-4" />
            <Lock className="h-4 w-4" />
            <span className="font-mono">Your data is encrypted and secure</span>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-accent-600 hover:text-accent-700">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
