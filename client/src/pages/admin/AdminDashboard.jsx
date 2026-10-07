import { ArrowRight, BookOpen, GraduationCap, Layers3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useAdminData } from '../../context/AdminContext';

const cardStyles = ['bg-blue-50 text-blue-700', 'bg-violet-50 text-violet-700', 'bg-emerald-50 text-emerald-700', 'bg-amber-50 text-amber-700'];
const statIcons = [Users, GraduationCap, BookOpen, Layers3];

function AdminDashboard() {
  const { users, courses } = useAdminData();
  const stats = [
    ['Total Students', users.filter((user) => user.role === 'STUDENT').length],
    ['Total Instructors', users.filter((user) => user.role === 'INSTRUCTOR').length],
    ['Total Courses', courses.length],
    ['Total Enrollments', courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)],
  ];
  const recentCourses = [...courses].sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 4);
  const recentUsers = [...users].sort((a, b) => b.joined.localeCompare(a.joined)).slice(0, 5);
  const categories = [...new Set(courses.map((course) => course.category))].map((category) => ({ category, count: courses.filter((course) => course.category === category).length }));

  return <div className="space-y-7">
    <PageHeading eyebrow="Academic administration" title="Good morning" description="A clear view of your learning community and course catalogue." />
    <section aria-label="Platform summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([label, value], index) => { const Icon = statIcons[index]; return <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value.toLocaleString()}</p><p className="mt-2 text-xs text-slate-500">Current platform total</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${cardStyles[index]}`}><Icon size={19}/></span></div></article>; })}
    </section>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catalogue</p><h2 className="mt-1 text-lg font-bold text-slate-900">Recent courses</h2></div><Link to="/admin/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">All courses <ArrowRight size={15}/></Link></div>
        <div className="divide-y divide-slate-100">{recentCourses.map((course) => <Link key={course.id} to={`/admin/courses/${course.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50"><div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.category} · {course.lessons.length} lessons</p></div><span className="shrink-0 text-xs font-medium text-slate-500">{course.enrollmentCount} learners</span></Link>)}</div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course statistics</p><h2 className="mt-1 text-lg font-bold text-slate-900">By category</h2></div><div className="space-y-5">{categories.map(({ category, count }) => <div key={category}><div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-700">{category}</span><span className="text-slate-500">{count} {count === 1 ? 'course' : 'courses'}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(12, (count / Math.max(courses.length, 1)) * 100)}%` }}/></div></div>)}</div></section>
    </div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Community</p><h2 className="mt-1 text-lg font-bold text-slate-900">Recent users</h2></div><Link to="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">Manage users <ArrowRight size={15}/></Link></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{recentUsers.map((person) => <tr key={person.id}><td className="px-5 py-3 font-semibold text-slate-800">{person.name}</td><td className="px-5 py-3 text-slate-600">{person.email}</td><td className="px-5 py-3 text-slate-600">{person.role === 'STUDENT' ? 'Student' : 'Instructor'}</td><td className="px-5 py-3"><StatusBadge status={person.status}/></td></tr>)}</tbody></table></div></section>
  </div>;
}

export default AdminDashboard;
