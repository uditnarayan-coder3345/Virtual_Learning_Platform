const tones = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  BLOCKED: 'bg-slate-100 text-slate-700 ring-slate-300',
  Submitted: 'bg-blue-50 text-blue-700 ring-blue-200',
  Graded: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Passed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Available: 'bg-blue-50 text-blue-700 ring-blue-200',
  Attempted: 'bg-slate-100 text-slate-600 ring-slate-200',
  Active: 'bg-blue-50 text-blue-700 ring-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};
const labels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  APPROVED: 'Approved',
  BLOCKED: 'Blocked',
};

function StatusBadge({ status, className = '' }) {
  const tone = tones[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone} ${className}`}>{labels[status] ?? status}</span>;
}

export default StatusBadge;
