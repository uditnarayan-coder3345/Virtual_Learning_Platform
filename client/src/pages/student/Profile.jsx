import { useState } from 'react';
import { BookOpen, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import { studentProfile } from '../../utils/mockData';

function Profile() {
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState(studentProfile);
  const [passwordNotice, setPasswordNotice] = useState('');

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    setEditing(false);
    setNotice('This profile is a preview. Changes are not saved.');
  };

  return (
    <div>
      <PageHeading title="My Profile" description="Your student details and account settings." action={<Button variant={editing ? 'secondary' : 'primary'} onClick={() => { setEditing((value) => !value); setNotice(''); }}>{editing ? 'Cancel' : 'Edit Profile'}</Button>} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 pb-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{profile.name.split(' ').map((part) => part[0]).join('')}</span>
            <div className="min-w-0 flex-1"><h2 className="text-lg font-bold text-slate-900">{profile.name}</h2><p className="mt-1 text-sm text-slate-500">{profile.program}</p></div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{profile.role}</span>
          </div>

          <form onSubmit={handleProfileSubmit} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={profile.name} readOnly={!editing} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} />
              <Input label="Email address" type="email" value={profile.email} readOnly={!editing} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
              <Input label="Phone number" type="tel" value={profile.phone} readOnly={!editing} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} />
              <Input label="Student ID" value={profile.studentId} readOnly />
            </div>
            {notice && <p role="status" className="mt-4 text-sm text-slate-500">{notice}</p>}
            {editing && <Button type="submit" className="mt-5">Save preview</Button>}
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Academic details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-center gap-3"><BookOpen size={17} className="text-blue-600" /><div><dt className="text-xs text-slate-500">Program</dt><dd className="mt-0.5 font-medium text-slate-800">{profile.program}</dd></div></div>
              <div className="flex items-center gap-3"><ShieldCheck size={17} className="text-blue-600" /><div><dt className="text-xs text-slate-500">Academic session</dt><dd className="mt-0.5 font-medium text-slate-800">{profile.academicSession}</dd></div></div>
              <div className="flex items-center gap-3"><UserRound size={17} className="text-blue-600" /><div><dt className="text-xs text-slate-500">Role</dt><dd className="mt-0.5 font-medium text-slate-800">{profile.role}</dd></div></div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><LockKeyhole size={18} className="text-blue-600" /><h2 className="font-bold text-slate-900">Change password</h2></div>
            <form onSubmit={(event) => { event.preventDefault(); setPasswordNotice('Password changes are not connected in this preview.'); }} className="mt-4 space-y-3">
              <Input label="Current password" type="password" autoComplete="current-password" />
              <Input label="New password" type="password" autoComplete="new-password" />
              {passwordNotice && <p role="status" className="text-xs text-slate-500">{passwordNotice}</p>}
              <Button type="submit" variant="secondary" className="w-full">Update Password</Button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Profile;