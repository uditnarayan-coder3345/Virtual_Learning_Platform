import { useState } from 'react';
import { ArrowLeft, CalendarClock, CheckCircle2, FileUp, Paperclip } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { assignments } from '../../utils/mockData';

function AssignmentDetails() {
  const { id } = useParams();
  const assignment = assignments.find((item) => item.id === id);
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!assignment) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="font-bold text-slate-900">Assignment not found</h1><Link to="/student/assignments" className="mt-3 inline-block text-sm font-semibold text-blue-700">Back to assignments</Link></div>;

  const currentStatus = submitted ? 'Submitted' : assignment.status;
  const dueDate = new Date(assignment.dueDate).toLocaleString('en', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!file) {
      setError('Choose a file to continue.');
      return;
    }
    setSubmitted(true);
    setError('');
  };

  return (
    <div>
      <Link to="/student/assignments" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Back to assignments</Link>
      <PageHeading title={assignment.title} description={assignment.course} action={<StatusBadge status={currentStatus} />} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Assignment brief</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{assignment.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><CalendarClock size={17} className="text-blue-600" />Due {dueDate}</span>
              <span>{assignment.totalMarks} total marks</span>
            </div>
          </section>

          {assignment.status === 'Graded' && (
            <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-bold text-slate-900">Instructor feedback</h2><span className="text-lg font-bold text-emerald-700">{assignment.marks}/{assignment.totalMarks}</span></div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{assignment.feedback}</p>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Your submission</h2>
            {currentStatus === 'Pending' ? (
              <form onSubmit={handleSubmit} className="mt-4">
                <label htmlFor="assignment-file" className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-blue-300 hover:bg-blue-50/40">
                  <FileUp size={24} className="text-blue-600" />
                  <span className="mt-2 text-sm font-semibold text-slate-800">Choose a file to upload</span>
                  <span className="mt-1 text-xs text-slate-500">File selection is a local UI preview only</span>
                  <input id="assignment-file" type="file" className="sr-only" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(''); }} />
                </label>
                {file && <p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><Paperclip size={15} />{file.name}</p>}
                {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
                <Button type="submit" className="mt-4" disabled={!file}><CheckCircle2 size={16} />Submit Assignment</Button>
              </form>
            ) : (
              <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17} />Submitted</p>
                <p className="mt-1 text-sm text-slate-600">Submitted {submitted ? new Date().toLocaleString() : new Date(assignment.submittedAt).toLocaleString()}</p>
                {file && <p className="mt-2 text-xs text-slate-500">Selected file: {file.name}</p>}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">Submission details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-3"><dt className="text-slate-500">Status</dt><dd><StatusBadge status={currentStatus} /></dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Due date</dt><dd className="text-right font-medium text-slate-700">{new Date(assignment.dueDate).toLocaleDateString()}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Marks</dt><dd className="font-medium text-slate-700">{assignment.marks === null ? `-- / ${assignment.totalMarks}` : `${assignment.marks} / ${assignment.totalMarks}`}</dd></div>
          </dl>
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">This demonstration does not send or store uploaded files.</p>
        </aside>
      </div>
    </div>
  );
}

export default AssignmentDetails;