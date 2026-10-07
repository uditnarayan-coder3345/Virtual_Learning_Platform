import { useState } from 'react';
import { Check, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import { useAuth } from '../../context/AuthContext';

const PROFILE_KEY = 'vlp-admin-demo-profile';
const defaultProfile = { name: 'Alex Morgan', email: 'admin@college.edu', phone: '+1 (555) 010-2040' };
function readProfile(user) {
  try { const saved = localStorage.getItem(PROFILE_KEY); if (saved) return { ...defaultProfile, ...JSON.parse(saved) }; } catch { /* Keep the demo profile available for this session. */ }
  return { ...defaultProfile, name: user?.name || defaultProfile.name };
}
function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => readProfile(user));
  const [saved, setSaved] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* The updated profile stays in this session. */ }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };
  return <div><PageHeading eyebrow="Workspace settings" title="Admin profile" description="Manage the contact information shown for your administrator account."/><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700"><UserRound size={22}/></span><div><h2 className="font-bold text-slate-900">Personal information</h2><p className="mt-1 text-sm text-slate-500">Your profile details for the demo workspace.</p></div></div><form onSubmit={submit} className="max-w-xl space-y-4"><Input label="Full name" required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Your name"/><Input label="Email address" type="email" required value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} placeholder="name@college.edu"/><Input label="Phone number" type="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="Add a phone number"/><div className="flex flex-wrap items-center gap-3 pt-2"><Button type="submit">Save changes</Button>{saved && <span role="status" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check size={16}/>Saved on this device</span>}</div></form></section><aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><ShieldCheck size={21}/></span><div><p className="font-semibold text-slate-900">Administrator</p><p className="mt-0.5 text-xs text-slate-500">Platform role</p></div></div><div className="mt-5 border-t border-slate-100 pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account email</p><p className="mt-1 flex items-center gap-2 break-all text-sm font-medium text-slate-700"><Mail size={15} className="shrink-0 text-slate-400"/>{profile.email}</p><p className="mt-4 text-xs leading-5 text-slate-500">Profile edits are stored locally in this browser for the current mock-data phase.</p></div></aside></div></div>;
}
export default AdminProfile;
