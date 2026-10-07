import { useMemo, useState } from 'react';
import { Eye, FileText, Search, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useInstructorData } from '../../context/InstructorContext';

function InstructorAssignments() {
  const { courses, setCourses } = useInstructorData();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [grading, setGrading] = useState(null);
  const [grade, setGrade] = useState({ marks: '', feedback: '' });
  const [notice, setNotice] = useState('');
  const allAssignments = useMemo(() => courses.flatMap((course) => course.assignments.map((assignment) => ({ ...assignment, courseId: course.id, courseTitle: course.title }))), [courses]);
  const visible = allAssignments.filter((item) => (courseFilter === 'ALL' || item.courseId === courseFilter)
    && `${item.title} ${item.courseTitle}`.toLowerCase().includes(search.trim().toLowerCase()));

  const submitGrade = (event) => {
    event.preventDefault();
    const { courseId, assignmentId, submission } = grading;
    setCourses((current) => current.map((course) => course.id !== courseId ? course : {
      ...course,
      assignments: course.assignments.map((assignment) => assignment.id !== assignmentId ? assignment : {
        ...assignment,
        submissions: assignment.submissions.map((entry) => entry.id === submission.id ? { ...entry, marks: Number(grade.marks), feedback: grade.feedback } : entry),
      }),
    }));
    setNotice(`Feedback saved for ${submission.student}.`);
    setGrading(null);
  };

  return <div>
    <PageHeading eyebrow="Assessment workspace" title="Assignments" description="Track submissions, grade student work, and share feedback." />
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search assignments" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by assignment or course" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter assignments by course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="ALL">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Assignment List</h2><p className="mt-1 text-xs text-slate-500">{visible.length} assignments · demo submissions</p></div><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Assignment</th><th className="px-5 py-3 font-semibold">Course</th><th className="px-5 py-3 font-semibold">Due date</th><th className="px-5 py-3 font-semibold">Submissions</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText size={17}/></span><div><p className="font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 text-xs text-slate-500">{item.totalMarks} marks</p></div></div></td><td className="px-5 py-4 text-slate-600">{item.courseTitle}</td><td className="px-5 py-4 text-slate-600">{new Date(`${item.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString()}</td><td className="px-5 py-4 text-slate-600">{item.submissions.length}</td><td className="px-5 py-4"><StatusBadge status={item.submissions.some((submission) => submission.marks == null) ? 'Pending' : 'Graded'}/></td><td className="px-5 py-4 text-right"><Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => setSelected(item)}><Eye size={15}/>View / grade</Button></td></tr>)}{visible.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">No assignments match these filters.</td></tr>}</tbody></table></div></section>
    {selected && <Dialog title={selected.title} onClose={() => setSelected(null)}><p className="mb-4 text-sm text-slate-500">{selected.courseTitle} · {selected.submissions.length} submissions</p><div className="divide-y divide-slate-100">{selected.submissions.map((submission) => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold text-slate-800">{submission.student}</p><p className="text-xs text-slate-500">{submission.email} · Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p>{submission.feedback && <p className="mt-1 max-w-md text-xs text-slate-600">{submission.feedback}</p>}</div><div className="flex items-center gap-2">{submission.marks == null ? <StatusBadge status="Pending"/> : <span className="text-sm font-semibold text-emerald-700">{submission.marks}/{selected.totalMarks}</span>}<Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => { setGrade({ marks: submission.marks ?? '', feedback: submission.feedback ?? '' }); setGrading({ courseId: selected.courseId, assignmentId: selected.id, submission }); }}>Grade / feedback</Button></div></div>)}{selected.submissions.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No submissions yet.</p>}</div></Dialog>}
    {grading && <Dialog title={grading.submission.student} onClose={() => setGrading(null)}><form onSubmit={submitGrade} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Marks (out of {selected.totalMarks})<input type="number" min="0" max={selected.totalMarks} required value={grade.marks} onChange={(event) => setGrade({ ...grade, marks: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-400"/></label><label className="block text-sm font-medium text-slate-700">Feedback<textarea rows={4} value={grade.feedback} onChange={(event) => setGrade({ ...grade, feedback: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-400" placeholder="Share feedback with the student"/></label><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setGrading(null)}>Cancel</Button><Button type="submit">Save grade</Button></div></form></Dialog>}
  </div>;
}

export default InstructorAssignments;
