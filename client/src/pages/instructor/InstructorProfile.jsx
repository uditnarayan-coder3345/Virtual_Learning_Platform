import { useState } from 'react';
import { Check, Mail, ShieldCheck, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import { useAuth } from '../../context/AuthContext';

function InstructorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || 'Instructor Demo', email: user?.email || 'instructor@college.edu', phone: user?.phone || '' });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const initials = profile.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const save = (event) => { event.preventDefault(); setEditing(false); setSaved(true); window.setTimeout(() => setSaved(false), 3000); };

  return <div>
    <PageHeading eyebrow="Workspace settings" title="Instructor Profile" description="Review your instructor details. Profile edits are a local UI preview only." action={<Button variant={editing ? 'secondary' : 'primary'} onClick={() => { setEditing((current) => !current); setSaved(false); }}>{editing ? 'Cancel' : 'Edit profile'}</Button>} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-6 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{initials || 'IN'}</span><div className="min-w-0 flex-1"><h2 className="text-lg font-bold text-slate-900">{profile.name}</h2><p className="mt-1 text-sm text-slate-500">Instructor account</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">INSTRUCTOR</span></div><form onSubmit={save} className="max-w-2xl"><div className="grid gap-4 sm:grid-cols-2"><Input label="Instructor name" required value={profile.name} readOnly={!editing} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}/><Input label="Email address" type="email" required value={profile.email} readOnly={!editing} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}/><Input label="Phone number" type="tel" value={profile.phone} readOnly={!editing} placeholder="Add a phone number" onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}/><Input label="Role" value="Instructor" readOnly/></div>{saved && <p role="status" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check size={16}/>Saved to this page preview.</p>}{editing && <Button type="submit" className="mt-5">Save profile preview</Button>}</form></section>
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-900">Account details</h2><div className="mt-5 space-y-4 border-t border-slate-100 pt-4"><Info icon={UserRound} label="Role" value="Instructor"/><Info icon={Mail} label="Contact email" value={profile.email}/><Info icon={ShieldCheck} label="Workspace" value="Instructor workspace"/></div><p className="mt-5 text-xs leading-5 text-slate-500">This profile is a frontend preview. Changes do not update your account or backend.</p></aside>
    </div>
  </div>;
}

function Info({ icon: Icon, label, value }) { return <div className="flex items-start gap-3"><Icon size={17} className="mt-0.5 shrink-0 text-blue-600"/><div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="mt-0.5 break-words text-sm font-medium text-slate-800">{value || 'Not provided'}</p></div></div>; }

export default InstructorProfile;
