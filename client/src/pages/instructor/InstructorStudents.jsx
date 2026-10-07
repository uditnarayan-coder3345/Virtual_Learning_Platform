import { useMemo, useState } from 'react';
import { Search, TrendingUp, UsersRound } from 'lucide-react';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useInstructorData } from '../../context/InstructorContext';

const progressData = [
  { id: 's1', name: 'Aarav Mehta', email: 'aarav.mehta@college.edu', courseId: 'data-structures', progress: 86, assignment: 'Graded', quizScore: '22 / 25' },
  { id: 's2', name: 'Sana Iqbal', email: 'sana.iqbal@college.edu', courseId: 'database-systems', progress: 74, assignment: 'Submitted', quizScore: '19 / 20' },
  { id: 's3', name: 'Riya Sen', email: 'riya.sen@college.edu', courseId: 'web-development', progress: 62, assignment: 'Pending', quizScore: '24 / 25' },
  { id: 's4', name: 'Kabir Das', email: 'kabir.das@college.edu', courseId: 'data-structures', progress: 48, assignment: 'Pending', quizScore: '17 / 25' },
  { id: 's5', name: 'Isha Roy', email: 'isha.roy@college.edu', courseId: 'cloud-computing', progress: 91, assignment: 'Graded', quizScore: '18 / 20' },
  { id: 's6', name: 'Dev Patel', email: 'dev.patel@college.edu', courseId: 'artificial-intelligence', progress: 35, assignment: 'Submitted', quizScore: '15 / 25' },
];

function InstructorStudents() {
  const { courses } = useInstructorData();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const visible = useMemo(() => progressData.map((student) => ({ ...student, course: courses.find((course) => course.id === student.courseId)?.title || 'General course' }))
    .filter((student) => (courseFilter === 'ALL' || student.courseId === courseFilter)
      && `${student.name} ${student.email} ${student.course}`.toLowerCase().includes(search.trim().toLowerCase())), [courses, courseFilter, search]);
  const averageProgress = Math.round(visible.reduce((sum, student) => sum + student.progress, 0) / Math.max(visible.length, 1));

  return <div>
    <PageHeading eyebrow="Learner insights" title="Students / Progress" description="Review demo progress, assignment status, and quiz scores across your courses." />
    <div className="mb-5 grid gap-4 sm:grid-cols-2"><article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><UsersRound size={20}/></span><div><p className="text-sm text-slate-500">Students shown</p><p className="mt-1 text-2xl font-bold text-slate-900">{visible.length}</p></div></article><article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><TrendingUp size={20}/></span><div><p className="text-sm text-slate-500">Average progress</p><p className="mt-1 text-2xl font-bold text-slate-900">{averageProgress}%</p></div></article></div>
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search students" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students or courses" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter students by course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="ALL">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Student Progress</h2><p className="mt-1 text-xs text-slate-500">Sample learner activity for UI demonstration</p></div><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Student</th><th className="px-5 py-3 font-semibold">Course</th><th className="px-5 py-3 font-semibold">Progress</th><th className="px-5 py-3 font-semibold">Assignment</th><th className="px-5 py-3 font-semibold">Quiz score</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((student) => <tr key={student.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-xs text-slate-500">{student.email}</p></td><td className="px-5 py-4 text-slate-600">{student.course}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-blue-600" style={{ width: `${student.progress}%` }}/></div><span className="text-xs font-medium text-slate-600">{student.progress}%</span></div></td><td className="px-5 py-4"><StatusBadge status={student.assignment}/></td><td className="px-5 py-4 font-semibold text-slate-700">{student.quizScore}</td></tr>)}{visible.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">No students match these filters.</td></tr>}</tbody></table></div></section>
  </div>;
}

export default InstructorStudents;
