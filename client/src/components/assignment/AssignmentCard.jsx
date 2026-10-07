import { ArrowUpRight, CalendarClock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';

function AssignmentCard({ assignment }) {
  const navigate = useNavigate();
  const due = new Date(assignment.dueDate);
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText size={19} /></span>
        <StatusBadge status={assignment.status} />
      </div>
      <h2 className="mt-4 text-base font-bold leading-6 text-slate-900">{assignment.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{assignment.course}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><CalendarClock size={15} />Due {due.toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
        <span>{assignment.marks === null ? `${assignment.totalMarks} marks` : `${assignment.marks}/${assignment.totalMarks} marks`}</span>
      </div>
      <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate(`/student/assignments/${assignment.id}`)}>
        {assignment.status === 'Pending' ? 'View Assignment' : 'View Details'} <ArrowUpRight size={16} />
      </Button>
    </article>
  );
}

export default AssignmentCard;