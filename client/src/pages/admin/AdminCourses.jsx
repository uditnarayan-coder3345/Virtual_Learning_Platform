import { useMemo, useState } from 'react';
import { BookOpen, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import { useAdminData } from '../../context/AdminContext';

const blankCourse = { title: '', description: '', category: '', thumbnail: '' };
function AdminCourses() {
  const { courses, setCourses } = useAdminData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [form, setForm] = useState(blankCourse);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const categories = useMemo(() => [...new Set(courses.map((course) => course.category).filter(Boolean))], [courses]);
  const visible = useMemo(() => courses.filter((course) => (category === 'ALL' || course.category === category) && `${course.title} ${course.description}`.toLowerCase().includes(search.toLowerCase())), [courses, category, search]);
  const reset = () => { setForm(blankCourse); setEditingId(null); setFormOpen(false); };
  const edit = (course) => { setForm({ title: course.title, description: course.description, category: course.category, thumbnail: course.thumbnail || '' }); setEditingId(course.id); setFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const save = (event) => {
    event.preventDefault();
    if (editingId) {
      setCourses((current) => current.map((course) => course.id === editingId ? { ...course, ...form } : course));
      setNotice('Course changes saved to this demo.');
    } else {
      const course = { ...form, id: `course-${Date.now()}`, instructor: 'Admin-managed', enrollmentCount: 0, lessons: [], assignments: [], quizzes: [] };
      setCourses((current) => [course, ...current]);
      setNotice('Course added to this demo.');
    }
    reset();
  };
  const remove = (course) => {
    if (!window.confirm(`Delete “${course.title}” and its demo content?`)) return;
    setCourses((current) => current.filter((item) => item.id !== course.id));
    setNotice(`“${course.title}” was deleted from this demo.`);
  };

  return <div>
    <PageHeading eyebrow="Learning catalogue" title="Courses" description="Create and maintain the courses available across your learning platform." action={<Button onClick={() => { setForm(blankCourse); setEditingId(null); setFormOpen((open) => !open); }}><Plus size={17}/>Add course</Button>}/>
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    {formOpen && <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen className="text-blue-600" size={19}/><h2 className="font-bold text-slate-900">{editingId ? 'Edit course' : 'Add course'}</h2></div><button onClick={reset} aria-label="Close course form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div><form onSubmit={save} className="grid gap-4 md:grid-cols-2"><Input label="Course title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Introduction to Data Science"/><Input label="Category" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Computer Science"/><Input label="Thumbnail URL" value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} placeholder="https://…"/><div className="hidden md:block"/><label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">Description<textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What will students learn?" className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/></label><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" onClick={reset}>Cancel</Button><Button type="submit">{editingId ? 'Save changes' : 'Create course'}</Button></div></form></section>}
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search courses" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or description" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="ALL">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-bold text-slate-900">Course catalogue</h2><p className="mt-1 text-xs text-slate-500">{visible.length} {visible.length === 1 ? 'course' : 'courses'}</p></div></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Course</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Instructor</th><th className="px-4 py-3 font-semibold">Students</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((course) => <tr key={course.id} className="hover:bg-slate-50"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }}/>}</div><div className="min-w-0"><p className="max-w-[300px] truncate font-semibold text-slate-800">{course.title}</p><p className="mt-0.5 text-xs text-slate-500">{course.lessons.length} lessons · {course.assignments.length} assignments · {course.quizzes.length} quizzes</p></div></div></td><td className="px-4 py-3"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{course.category}</span></td><td className="px-4 py-3 text-slate-600">{course.instructor || 'Admin-managed'}</td><td className="px-4 py-3 text-slate-600">{course.enrollmentCount}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><Link to={`/admin/courses/${course.id}`} aria-label={`View ${course.title}`} title="View details" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Eye size={16}/></Link><button onClick={() => edit(course)} aria-label={`Edit ${course.title}`} title="Edit course" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16}/></button><button onClick={() => remove(course)} aria-label={`Delete ${course.title}`} title="Delete course" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div></td></tr>)}{visible.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No courses match these filters.</td></tr>}</tbody></table></div></section>
  </div>;
}
export default AdminCourses;
