import { useState } from 'react';
import { ArrowRight, BookOpenCheck, GraduationCap, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';

const roles = [
  { value: 'student', label: 'Student', icon: GraduationCap },
  { value: 'instructor', label: 'Instructor', icon: UserRound },
  { value: 'admin', label: 'Admin', icon: ShieldCheck },
];

function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (nextRole) => {
    if (nextRole !== role) {
      setEmail('');
      setPassword('');
    }
    setRole(nextRole);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await login({ email: normalizedEmail, password, role: role.toUpperCase(), remember: rememberSession });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid min-h-[min(760px,calc(100vh-4rem))] max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_-36px_rgba(30,41,59,0.25)] lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="hidden flex-col justify-between bg-[#eef2ff] p-10 lg:flex xl:p-12">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><BookOpenCheck size={23} /></span>
            <span className="text-lg font-bold text-slate-900">Learnwise</span>
          </div>
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-blue-700">YOUR CAMPUS, CONNECTED</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-[#172554]">Make every learning moment count.</h1>
            <p className="mt-4 leading-7 text-slate-600">One focused space for your courses, assignments, and academic progress.</p>
          </div>
          <p className="text-xs text-slate-500">Virtual Learning Platform · MCA</p>
        </aside>

        <main className="flex items-center justify-center px-5 py-9 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"><BookOpenCheck size={21} /></span>
              <span className="font-bold text-slate-900">Learnwise</span>
            </div>
            <p className="text-sm font-semibold text-blue-700">WELCOME BACK</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Sign in to VLP</h2>
            <p className="mt-2 text-sm text-slate-500">Choose your workspace and continue learning.</p>
            {location.state?.registrationSuccess && <p role="status" className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Your account was created and is pending Admin approval. You can sign in after it is approved.</p>}

            <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-5">
              <fieldset>
                <legend className="mb-2.5 text-sm font-medium text-slate-700">Academic role</legend>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRoleChange(value)}
                      aria-pressed={role === value}
                      className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors ${role === value ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Icon size={19} aria-hidden="true" />{label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Input label="Email address" type="email" autoComplete="username" placeholder="you@college.edu" required value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} />
              <Input label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} />
              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(event) => setRememberSession(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Remember session
              </label>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign in'} {!isSubmitting && <ArrowRight size={17} />}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">New to the platform? <Link to="/register" className="font-semibold text-blue-700 hover:text-blue-800">Create an account</Link></p>
            <p className="mt-6 text-center text-xs text-slate-400">Sign in with your registered account.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;
