import { ArrowRight, BookOpen, ClipboardCheck, FileText, TrendingUp, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useInstructorData } from '../../context/InstructorContext';

const performances = [
  { name: 'Aarav Mehta', course: 'Data Structures & Algorithms', progress: 86, score: 92 },
  { name: 'Sana Iqbal', course: 'Database Management Systems', progress: 74, score: 84 },
  { name: 'Riya Sen', course: 'Web Application Development', progress: 62, score: 78 },
  { name: 'Kabir Das', course: 'Data Structures & Algorithms', progress: 48, score: 69 },
];

function InstructorDashboard() {
  const { courses } = useInstructorData();
  const assignments = courses.flatMap((course) => course.assignments.map((item) => ({ ...item, course: course.title })));
  const quizzes = courses.flatMap((course) => course.quizzes.map((item) => ({ ...item, course: course.title })));
  const submissions = assignments.flatMap((assignment) => assignment.submissions.map((submission) => ({ ...submission, assignment: assignment.title, course: assignment.course }))).slice(0, 5);
  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Total Students', value: courses.reduce((sum, course) => sum + course.students, 0), icon: UsersRound, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Total Assignments', value: assignments.length, icon: FileText, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Total Quizzes', value: quizzes.length, icon: ClipboardCheck, tone: 'bg-emerald-50 text-emerald-700' },
  ];

  return <div>
    <PageHeading eyebrow="Instructor workspace" title="Dashboard" description="A quick overview of your courses, submissions, and learner progress." />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Instructor statistics">
      {stats.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={19}/></span></div><p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">Current demo workspace</p></article>)}
    </section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your teaching space</p><h2 className="mt-1 font-bold text-slate-900">Recent Courses</h2></div><Link to="/instructor/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">All courses <ArrowRight size={15}/></Link></div><div className="divide-y divide-slate-100">{courses.slice(0, 4).map((course) => <Link key={course.id} to={`/instructor/courses/${course.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"><div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.students} students · {course.lessons.length} lessons</p></div><span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">{course.category}</span></Link>)}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Needs review</p><h2 className="mt-1 font-bold text-slate-900">Recent Assignment Submissions</h2></div><div className="divide-y divide-slate-100">{submissions.slice(0, 4).map((submission) => <div key={submission.id} className="flex items-start justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{submission.student}</p><p className="mt-1 truncate text-xs text-slate-500">{submission.assignment} · {submission.course}</p></div><StatusBadge status={submission.marks == null ? 'Pending' : 'Graded'}/></div>)}</div><Link to="/instructor/assignments" className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50/60">Review submissions <ArrowRight size={15}/></Link></section>
    </div>
    <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><TrendingUp size={19}/></span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Learning snapshot</p><h2 className="font-bold text-slate-900">Student Performance Summary</h2></div></div><div className="overflow-x-auto"><table className="min-w-[650px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Student</th><th className="px-5 py-3 font-semibold">Course</th><th className="px-5 py-3 font-semibold">Progress</th><th className="px-5 py-3 font-semibold">Quiz average</th></tr></thead><tbody className="divide-y divide-slate-100">{performances.map((student) => <tr key={`${student.name}-${student.course}`}><td className="px-5 py-3 font-semibold text-slate-800">{student.name}</td><td className="px-5 py-3 text-slate-600">{student.course}</td><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-blue-600" style={{ width: `${student.progress}%` }}/></div><span className="text-xs text-slate-500">{student.progress}%</span></div></td><td className="px-5 py-3 font-semibold text-slate-700">{student.score}%</td></tr>)}</tbody></table></div></section>
  </div>;
}

export default InstructorDashboard;
