import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase, TALENT_CATEGORIES } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune', 'Hyderabad',
  'Chennai', 'Kolkata', 'Jaipur', 'Kohima', 'Shillong',
];

type Role = 'talent' | 'organizer' | null;

export function SignUpPage() {
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');

  // Talent fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [talentCategory, setTalentCategory] = useState('');

  // Organizer fields
  const [orgName, setOrgName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    if (!email || !password || !city) {
      showToast('error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      showToast('error', error.message);
      return;
    }

    if (data.user) {
      const profileData: Record<string, string> = {
        id: data.user.id,
        full_name: role === 'talent' ? fullName : organizerName,
        role,
        city,
        phone: role === 'talent' ? phone : contactNumber,
      };
      if (role === 'talent') profileData.talent_category = talentCategory;
      if (role === 'organizer') profileData.organization_name = orgName;

      const { error: profileError } = await supabase.from('profiles').insert(profileData);
      setLoading(false);

      if (profileError) {
        showToast('error', 'Account created but profile setup failed. Please contact support.');
        return;
      }

      showToast('success', 'Account created successfully!');
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
          {!role ? (
            <>
              <h1 className="font-display text-2xl font-extrabold text-ink-900">Create your account</h1>
              <p className="mt-1.5 text-sm text-ink-500">Choose your role to get started</p>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setRole('talent')}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 text-left transition-all hover:border-accent-300 hover:bg-accent-50/50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                    <User className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-ink-900">I am a Talent</p>
                    <p className="text-sm text-ink-500">Find events and showcase your skills</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-ink-300 transition-all group-hover:text-accent-600 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => setRole('organizer')}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5 text-left transition-all hover:border-accent-300 hover:bg-accent-50/50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-600 group-hover:text-white">
                    <Building2 className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-ink-900">I am an Event Organizer</p>
                    <p className="text-sm text-ink-500">Post events and discover talent</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-ink-300 transition-all group-hover:text-accent-600 group-hover:translate-x-1" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setRole(null)}
                className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <h1 className="font-display text-2xl font-extrabold text-ink-900">
                {role === 'talent' ? 'Talent Registration' : 'Organizer Registration'}
              </h1>
              <p className="mt-1.5 text-sm text-ink-500">Fill in your details to create your account</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {role === 'talent' ? (
                  <>
                    <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Select label="City" options={CITIES} value={city} onChange={(e) => setCity(e.target.value)} />
                    <Select label="Talent Category" options={TALENT_CATEGORIES} value={talentCategory} onChange={(e) => setTalentCategory(e.target.value)} />
                    <Input label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </>
                ) : (
                  <>
                    <Input label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                    <Input label="Organizer Name" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
                    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <Select label="City" options={CITIES} value={city} onChange={(e) => setCity(e.target.value)} />
                    <Input label="Contact Number" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                  </>
                )}

                <Button type="submit" fullWidth size="lg" disabled={loading} className="group">
                  {loading ? 'Creating account...' : 'Create Account'}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-600 hover:text-accent-700">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
