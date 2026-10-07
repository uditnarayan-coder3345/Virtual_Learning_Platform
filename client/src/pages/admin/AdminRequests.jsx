import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Eye, FileText, Search, ShieldCheck, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { getAdminReports, getPendingAdminUsers, updateAdminReport, updateAdminUserStatus } from '../../services/adminApi';

const categories = {
  PAYMENT_ISSUE: 'Payment Issue',
  COURSE_ACCESS_ISSUE: 'Course Access Issue',
  ASSIGNMENT_ISSUE: 'Assignment Issue',
  QUIZ_ISSUE: 'Quiz Issue',
  INSTRUCTOR_ISSUE: 'Instructor Issue',
  TECHNICAL_ISSUE: 'Technical Issue',
  OTHER: 'Other',
};
const statusFilters = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REJECTED', label: 'Rejected' },
];
const dateLabel = (value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reportDraft, setReportDraft] = useState({ status: 'PENDING', adminResponse: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingResult, reportResult] = await Promise.all([getPendingAdminUsers(), getAdminReports()]);
      setRequests((pendingResult.users || []).filter((user) => user.role === 'INSTRUCTOR'));
      setReports(reportResult.reports || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load requests and reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const rows = useMemo(() => [
    ...requests.map((user) => ({ id: `instructor-${user.id}`, rawId: user.id, kind: 'INSTRUCTOR', user: user.name, email: user.email, subject: 'Instructor approval request', category: 'Instructor Request', date: user.createdAt, status: user.status, details: user })),
    ...reports.map((report) => ({ id: `report-${report.id}`, rawId: report.id, kind: 'REPORT', user: report.user.name, email: report.user.email, subject: report.subject, category: categories[report.category] || report.category, date: report.createdAt, status: report.status, details: report })),
  ].filter((item) => (type === 'ALL' || item.kind === type)
    && (status === 'ALL' || item.status === status)
    && `${item.user} ${item.email} ${item.subject} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date)), [requests, reports, type, status, search]);

  const openItem = (item) => {
    setSelected(item);
    if (item.kind === 'REPORT') setReportDraft({ status: item.details.status, adminResponse: item.details.adminResponse || '' });
  };

  const changeInstructorStatus = async (action) => {
    const actionLabel = action === 'approve' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${selected.details.name}?`)) return;
    setBusy(true);
    setError('');
    try {
      await updateAdminUserStatus(selected.rawId, action);
      setNotice(`${selected.details.name} was ${action === 'approve' ? 'approved' : 'rejected'}.`);
      setSelected(null);
      await loadItems();
    } catch (requestError) {
      setError(requestError.message || `Unable to ${actionLabel} instructor.`);
    } finally {
      setBusy(false);
    }
  };

  const saveReport = async (event) => {
    event.preventDefault();
    if (reportDraft.status === 'REJECTED' && selected.details.status !== 'REJECTED'
      && !window.confirm(`Reject the report “${selected.details.subject}”?`)) return;
    setBusy(true);
    setError('');
    try {
      const result = await updateAdminReport(selected.rawId, reportDraft);
      setNotice('Report status and response updated.');
      setSelected({ ...selected, details: result.report, status: result.report.status });
      await loadItems();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update report.');
    } finally {
      setBusy(false);
    }
  };

  return <div>
    <PageHeading eyebrow="Community administration" title="Requests & Reports" description="Review Instructor access requests and respond to Student issues." />
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Request and report type">
      {[{ value: 'ALL', label: 'All' }, { value: 'INSTRUCTOR', label: 'Instructor Requests' }, { value: 'REPORT', label: 'Student Reports' }].map((item) => <button key={item.value} role="tab" aria-selected={type === item.value} onClick={() => setType(item.value)} className={`rounded-lg border px-4 py-2 text-sm font-semibold ${type === item.value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item.label}</button>)}
    </div>
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search requests and reports" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by user, subject, or category" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">{statusFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Review Queue</h2><p className="mt-1 text-xs text-slate-500">{loading ? 'Loading…' : `${rows.length} items`}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText size={18}/></span></div><div className="overflow-x-auto"><table className="min-w-[950px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Type</th><th className="px-4 py-3 font-semibold">User</th><th className="px-4 py-3 font-semibold">Subject</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.kind === 'INSTRUCTOR' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>{item.kind === 'INSTRUCTOR' ? 'Instructor Request' : 'Student Report'}</span></td><td className="px-4 py-3"><p className="font-semibold text-slate-800">{item.user}</p><p className="mt-0.5 text-xs text-slate-500">{item.email}</p></td><td className="max-w-[240px] truncate px-4 py-3 font-medium text-slate-700">{item.subject}</td><td className="px-4 py-3 text-slate-600">{item.category}</td><td className="whitespace-nowrap px-4 py-3 text-slate-500">{dateLabel(item.date)}</td><td className="px-4 py-3"><StatusBadge status={item.status}/></td><td className="px-4 py-3 text-right"><Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => openItem(item)}><Eye size={15}/>{item.kind === 'INSTRUCTOR' ? 'View request' : 'View / update'}</Button></td></tr>)}{!loading && rows.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">No requests or reports match these filters.</td></tr>}</tbody></table></div></section>

    {selected?.kind === 'INSTRUCTOR' && <Dialog title="Instructor approval request" eyebrow="Account request" onClose={() => setSelected(null)}><div className="mb-5 flex items-center gap-3 rounded-lg bg-blue-50/70 p-4"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-700"><ShieldCheck size={20}/></span><div><p className="font-semibold text-slate-900">{selected.details.name}</p><p className="text-xs text-slate-500">Instructor account request</p></div><div className="ml-auto"><StatusBadge status={selected.details.status}/></div></div><dl className="grid gap-4 sm:grid-cols-2">{[['Name', selected.details.name], ['Email', selected.details.email], ['Phone', selected.details.phone || 'Not provided'], ['Registration date', dateLabel(selected.details.createdAt)], ['Role', selected.details.role], ['Current status', selected.details.status]].map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-800">{value}</dd></div>)}</dl><div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setSelected(null)}>Close</Button><Button variant="secondary" disabled={busy} onClick={() => changeInstructorStatus('reject')} className="text-red-700 hover:bg-red-50">Reject</Button><Button disabled={busy} onClick={() => changeInstructorStatus('approve')}><Check size={16}/>Approve</Button></div></Dialog>}

    {selected?.kind === 'REPORT' && <Dialog title={selected.details.subject} eyebrow="Student report" onClose={() => setSelected(null)}><div className="mb-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2"><Info label="Student" value={selected.details.user.name}/><Info label="Email" value={selected.details.user.email}/><Info label="Category" value={categories[selected.details.category]}/><Info label="Submitted" value={dateLabel(selected.details.createdAt)}/><Info label="Report ID" value={selected.details.id}/><Info label="Status" value={selected.details.status}/></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.details.description}</p></div><form onSubmit={saveReport} className="mt-5 space-y-4 border-t border-slate-100 pt-5"><label className="block text-sm font-medium text-slate-700">Status<select value={reportDraft.status} onChange={(event) => setReportDraft({ ...reportDraft, status: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3"><option value="PENDING" disabled={selected.details.status !== 'PENDING'}>Pending</option><option value="IN_PROGRESS" disabled={!['PENDING', 'IN_PROGRESS'].includes(selected.details.status)}>In Progress</option><option value="RESOLVED" disabled={['RESOLVED', 'REJECTED'].includes(selected.details.status)}>Resolved</option><option value="REJECTED" disabled={['RESOLVED', 'REJECTED'].includes(selected.details.status)}>Rejected</option></select></label><label className="block text-sm font-medium text-slate-700">Admin response / resolution<textarea maxLength={5000} rows={4} value={reportDraft.adminResponse} onChange={(event) => setReportDraft({ ...reportDraft, adminResponse: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-400" placeholder="Add a response for the student"/></label>{selected.details.resolvedAt && <Info label="Resolved date" value={dateLabel(selected.details.resolvedAt)}/>}<div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setSelected(null)}>Close</Button><Button type="submit" disabled={busy}>Save status and response</Button></div></form></Dialog>}
  </div>;
}

function Info({ label, value }) { return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-800">{value || 'Not provided'}</p></div>; }

export default AdminRequests;
