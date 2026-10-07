import { useCallback, useEffect, useState } from 'react';
import { Ban, Check, Search, UserRound, X } from 'lucide-react';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { getAdminUsers, getPendingAdminUsers, updateAdminUserStatus } from '../../services/adminApi';

const statuses = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Blocked', value: 'BLOCKED' },
];
const roles = ['ALL', 'STUDENT', 'INSTRUCTOR'];
const dateLabel = (value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = status === 'PENDING'
        ? await getPendingAdminUsers()
        : await getAdminUsers({ status, search, ...(role !== 'ALL' ? { role } : {}) });
      let fetched = result.users ?? [];
      if (status === 'PENDING') {
        const needle = search.trim().toLowerCase();
        fetched = fetched.filter((person) => (role === 'ALL' || person.role === role)
          && (!needle || `${person.name} ${person.email}`.toLowerCase().includes(needle)));
      }
      setUsers(fetched);
      setSelected((current) => current ? fetched.find((person) => person.id === current.id) ?? null : null);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load accounts.');
    } finally {
      setLoading(false);
    }
  }, [status, search, role]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const changeStatus = async (person, action) => {
    setBusyId(person.id);
    setError('');
    try {
      const result = await updateAdminUserStatus(person.id, action);
      const updated = result.user;
      setNotice(`${person.name} was ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'block' ? 'blocked' : 'unblocked'}.`);
      if (selected?.id === person.id) setSelected(updated);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update account status.');
    } finally {
      setBusyId('');
    }
  };

  const actionButtons = (person) => <div className="flex justify-end gap-1">
    {person.status === 'PENDING' && <>
      <button disabled={busyId === person.id} onClick={() => changeStatus(person, 'approve')} aria-label={`Approve ${person.name}`} title="Approve" className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><Check size={16}/></button>
      <button disabled={busyId === person.id} onClick={() => changeStatus(person, 'reject')} aria-label={`Reject ${person.name}`} title="Reject" className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><X size={16}/></button>
    </>}
    {person.status === 'APPROVED' && <button disabled={busyId === person.id} onClick={() => changeStatus(person, 'block')} aria-label={`Block ${person.name}`} title="Block" className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-50"><Ban size={16}/></button>}
    {person.status === 'BLOCKED' && <button disabled={busyId === person.id} onClick={() => changeStatus(person, 'unblock')} aria-label={`Unblock ${person.name}`} title="Unblock" className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"><Check size={16}/></button>}
  </div>;

  return <div>
    <PageHeading eyebrow="Community administration" title="Users" description="Review account requests and manage student and instructor access." />
    <div role="tablist" aria-label="Account status" className="mb-5 flex flex-wrap gap-2">
      {statuses.map((item) => <button key={item.value} role="tab" aria-selected={status === item.value} onClick={() => setStatus(item.value)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${status === item.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item.label}</button>)}
    </div>
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input aria-label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter by role" value={role} onChange={(event) => setRole(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="ALL">All roles</option><option value="STUDENT">Students</option><option value="INSTRUCTOR">Instructors</option></select></div>
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">{statuses.find((item) => item.value === status)?.label} accounts</h2><p className="mt-1 text-xs text-slate-500">{loading ? 'Loading accounts…' : `${users.length} ${users.length === 1 ? 'account' : 'accounts'}`}</p></div></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Joined</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((person) => <tr key={person.id} className="hover:bg-slate-50"><td className="px-4 py-3"><button onClick={() => setSelected(person)} className="text-left font-semibold text-slate-800 hover:text-blue-700">{person.name}<span className="mt-0.5 block text-xs font-normal text-slate-500">{person.email}</span></button></td><td className="px-4 py-3 text-slate-600">{person.role === 'STUDENT' ? 'Student' : 'Instructor'}</td><td className="px-4 py-3"><StatusBadge status={person.status}/></td><td className="px-4 py-3 text-slate-500">{dateLabel(person.createdAt)}</td><td className="px-4 py-3">{actionButtons(person)}</td></tr>)}{!loading && users.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No accounts match these filters.</td></tr>}</tbody></table></div></section>
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><UserRound size={18} className="text-blue-600"/><h2 className="font-bold text-slate-900">User details</h2></div>{selected ? <div className="mt-5 space-y-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{selected.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{selected.name}</p><p className="text-xs text-slate-500">{selected.role === 'STUDENT' ? 'Student' : 'Instructor'}</p></div></div><div className="space-y-3 border-t border-slate-100 pt-4 text-sm"><Detail label="Email" value={selected.email}/><Detail label="Phone" value={selected.phone || 'Not provided'}/><Detail label="Joined" value={dateLabel(selected.createdAt)}/><Detail label="Account status" value={selected.status}/></div>{actionButtons(selected)}</div> : <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500">Select an account to see its details.</div>}</aside></div>
  </div>;
}
function Detail({ label, value }) { return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words font-medium text-slate-700">{value}</p></div>; }
export default AdminUsers;
