import { useMemo } from 'react';
import { CheckCircle2, ClipboardCheck, FileText, Trophy } from 'lucide-react';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';

function Results() {
  const quizResults = [];
  const assignmentResults = [];
  const average = useMemo(() => quizResults.length
    ? Math.round(quizResults.reduce((sum, result) => sum + result.percentage, 0) / quizResults.length)
    : 0, []);

  return (
    <div>
      <PageHeading title="Results & Performance" description="Review your quiz scores, assignment marks, and instructor feedback." />
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Quiz average</p><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Trophy size={18} /></span></div><p className="mt-3 text-3xl font-bold text-slate-900">{quizResults.length ? `${average}%` : '—'}</p><p className="mt-1 text-xs text-slate-500">{quizResults.length ? `Across ${quizResults.length} completed quizzes` : 'No completed quizzes yet'}</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Quiz attempts</p><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><ClipboardCheck size={18} /></span></div><p className="mt-3 text-3xl font-bold text-slate-900">{quizResults.length}</p><p className="mt-1 text-xs text-slate-500">{quizResults.filter((item) => item.status === 'Passed').length} marked as passed</p></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">Graded assignments</p><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700"><FileText size={18} /></span></div><p className="mt-3 text-3xl font-bold text-slate-900">{assignmentResults.length}</p><p className="mt-1 text-xs text-slate-500">Feedback available below</p></article>
      </section>

      <section className="mb-7">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Knowledge checks</p><h2 className="mt-1 text-lg font-bold text-slate-900">Quiz results</h2></div><span className="text-sm text-slate-500">Aggregate: <strong className="text-slate-800">{average}%</strong></span></div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_120px_140px_110px] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"><span>Quiz</span><span>Course</span><span>Score</span><span>Attempt date</span><span>Status</span></div>
          {quizResults.length === 0 && <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">No quiz results yet.</p>}
          {quizResults.map((result) => (
            <article key={result.id} className="grid gap-2 border-t border-slate-100 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_120px_140px_110px] md:items-center md:gap-4">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{result.title}</p><p className="mt-1 text-xs text-slate-500 md:hidden">{result.course}</p></div>
              <span className="hidden truncate text-sm text-slate-500 md:block">{result.course}</span>
              <span className="text-sm font-bold text-emerald-700">{result.score}/{result.totalMarks} <span className="font-medium text-slate-500">({result.percentage}%)</span></span>
              <span className="text-xs text-slate-500">{result.attemptedAt}</span><StatusBadge status={result.status} className="w-fit" />
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coursework</p><h2 className="mt-1 text-lg font-bold text-slate-900">Assignment marks</h2></div>
        <div className="space-y-3">
          {assignmentResults.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No graded assignments yet.</p>}
          {assignmentResults.map((assignment) => (
            <article key={assignment.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><h3 className="font-semibold text-slate-900">{assignment.title}</h3><p className="mt-1 text-sm text-slate-500">{assignment.course}</p></div>
                <span className="inline-flex items-center gap-1.5 text-lg font-bold text-emerald-700"><CheckCircle2 size={17} />{assignment.marks}/{assignment.totalMarks}</span>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Instructor feedback</p><p className="mt-1.5 text-sm leading-6 text-slate-600">{assignment.feedback}</p></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Results;
