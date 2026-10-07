import { useCallback, useEffect, useState } from 'react';
import { FileText, Send, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { createStudentReport, getStudentReports } from '../../services/studentReportsApi';

const categoryOptions = [
  ['PAYMENT_ISSUE', 'Payment Issue'],
  ['COURSE_ACCESS_ISSUE', 'Course Access Issue'],
  ['ASSIGNMENT_ISSUE', 'Assignment Issue'],
  ['QUIZ_ISSUE', 'Quiz Issue'],
  ['INSTRUCTOR_ISSUE', 'Instructor Issue'],
  ['TECHNICAL_ISSUE', 'Technical Issue'],
  ['OTHER', 'Other'],
];
const dateLabel = (value) => new Date(value).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' });

function StudentReports() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ category: 'TECHNICAL_ISSUE', subject: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadReports = useCallback(async () => {
    setError('');
    try {
      const result = await getStudentReports();
      setReports(result.reports || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load your reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const result = await createStudentReport(form);
      setReports((current) => [result.report, ...current]);
      setForm({ category: 'TECHNICAL_ISSUE', subject: '', description: '' });
      setNotice('Your report was submitted. You can follow its status and Admin response below.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit your report.');
    } finally {
      setSubmitting(false);
    }
  };

  return <div>
    <PageHeading eyebrow="Student support" title="Requests & Reports" description="Report a problem and follow the response from the platform Admin." />
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText size={19}/></span><div><h2 className="font-bold text-slate-900">Submit a report</h2><p className="mt-0.5 text-sm text-slate-500">Describe the issue so the support team can review it.</p></div></div><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><label className="space-y-1.5 text-sm font-medium text-slate-700">Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">{categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><Input label="Subject" required minLength={3} maxLength={160} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Briefly summarize the issue"/><label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">Description<textarea required minLength={10} maxLength={5000} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Include details that will help us review your report." className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/><span className="block text-xs font-normal text-slate-400">Payment Issue is for manually reporting a payment-related problem. No payment processing is provided here.</span></label><div className="flex justify-end md:col-span-2"><Button type="submit" loading={submitting}><Send size={16}/>Submit report</Button></div></form></section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">My Reports</h2><p className="mt-1 text-xs text-slate-500">Only reports submitted from your account are shown.</p></div>{loading ? <p className="p-8 text-center text-sm text-slate-500">Loading your reports…</p> : reports.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">You have not submitted any reports yet.</p> : <div className="divide-y divide-slate-100">{reports.map((report) => <article key={report.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{categoryOptions.find(([value]) => value === report.category)?.[1] || report.category}</span><h3 className="mt-3 font-bold text-slate-900">{report.subject}</h3><p className="mt-1 text-xs text-slate-500">Submitted {dateLabel(report.createdAt)}</p></div><StatusBadge status={report.status}/></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{report.description}</p>{report.adminResponse && <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Admin response</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.adminResponse}</p></div>}{report.resolvedAt && <p className="mt-3 text-xs text-slate-500">Resolved {dateLabel(report.resolvedAt)}</p>}</article>)}</div>}</section>
  </div>;
}

export default StudentReports;
