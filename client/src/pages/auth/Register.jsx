import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const accountTypes = [
  {
    value: 'STUDENT',
    title: 'Student',
    description: 'Learn courses, complete assignments and take quizzes.',
    icon: GraduationCap,
  },
  {
    value: 'TEACHER',
    title: 'Teacher',
    description: 'Create courses, lessons, assignments and quizzes.',
    icon: BookOpenCheck,
  },
];

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('account-type');
  const [accountType, setAccountType] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone.trim() || undefined,
          accountType,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to create account.');
      }

      navigate('/login', { replace: true, state: { registrationSuccess: true } });
    } catch (requestError) {
      setError(requestError.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6fb] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-36px_rgba(30,41,59,0.25)] sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft size={16} /> Back to sign in</Link>
        <div className="mt-7 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><BookOpenCheck size={22} /></div>
        <p className="mt-6 text-sm font-semibold text-blue-700">GET STARTED</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Create Your Account</h1>

        {step === 'account-type' ? (
          <>
            <p className="mt-2 text-sm text-slate-500">Choose your account type</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {accountTypes.map(({ value, title, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={accountType === value}
                  onClick={() => setAccountType(value)}
                  className={`min-h-44 rounded-xl border p-5 text-left transition-colors ${accountType === value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accountType === value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={21} /></span>
                  <span className="mt-4 block text-sm font-semibold text-slate-900">{title}</span>
                  <span className="mt-1.5 block text-sm leading-5 text-slate-500">{description}</span>
                </button>
              ))}
            </div>
            <Button type="button" className="mt-6 w-full" onClick={() => setStep('form')}>Continue <ArrowRight size={17} /></Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">Create your {accountType === 'TEACHER' ? 'teacher' : 'student'} account.</p>
            <button type="button" onClick={() => { setStep('account-type'); setError(''); }} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"><ArrowLeft size={15} />Change account type</button>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Input label="Full name" autoComplete="name" placeholder="Alex Morgan" required value={name} onChange={(event) => setName(event.target.value)} />
              <Input label="College email" type="email" autoComplete="email" placeholder="you@college.edu" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input label="Phone (optional)" type="tel" autoComplete="tel" placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Input label="Password" type="password" autoComplete="new-password" placeholder="Create a password" minLength={8} required value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} />
              <Input label="Confirm password" type="password" autoComplete="new-password" placeholder="Enter it again" required value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }} />
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default Register;
