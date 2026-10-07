import { useMemo, useState } from 'react';
import { BookOpen, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import { useInstructorData } from '../../context/InstructorContext';
import { createInstructorCourse, deleteInstructorCourse as deleteCourseRequest, updateInstructorCourse } from '../../services/instructorApi';

const emptyCourse = { title: '', description: '', category: '', thumbnail: '' };
function InstructorCourses() {
  const { courses, setCourses } = useInstructorData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [draft, setDraft] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const categories = useMemo(() => [...new Set(courses.map((course) => course.category).filter(Boolean))], [courses]);
  const visible = useMemo(() => courses.filter((course) => (category === 'ALL' || course.category === category)
    && `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(search.trim().toLowerCase())), [courses, category, search]);

  const closeForm = () => { setFormOpen(false); setEditingId(null); setDraft(emptyCourse); };
  const editCourse = (course) => {
    setEditingId(course.id);
    setDraft({ title: course.title, description: course.description, category: course.category, thumbnail: course.thumbnail || '' });
    setFormOpen(true);
  };
  const saveCourse = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = editingId
        ? await updateInstructorCourse(editingId, draft)
        : await createInstructorCourse(draft);
      const course = { ...result.course, code: result.course.id.slice(0, 8).toUpperCase(), instructor: result.course.instructor?.name || 'You', students: 0, lessons: [], assignments: [], quizzes: [] };
      setCourses((current) => editingId
        ? current.map((item) => item.id === editingId ? { ...item, ...course } : item)
        : [course, ...current]);
      setNotice(editingId ? 'Course changes saved.' : 'Course created successfully.');
      closeForm();
    } catch (requestError) {
      setError(requestError.message || 'Unable to save course.');
    } finally {
      setBusy(false);
    }
  };
  const deleteCourse = async (course) => {
    if (!window.confirm(`Delete “${course.title}”? This also removes its course content and enrollments.`)) return;
    setError('');
    try {
      await deleteCourseRequest(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      setNotice(`“${course.title}” was deleted.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete course.');
    }
  };

  return <div>
    <PageHeading eyebrow="Teaching workspace" title="My Courses" description="Create courses and manage their lessons, assignments, and quizzes." action={<Button onClick={() => { setDraft(emptyCourse); setEditingId(null); setFormOpen(true); }}><Plus size={17}/>Create Course</Button>} />
    {notice && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search courses" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter courses by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"><option value="ALL">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    {formOpen && <section className="mb-5 rounded-xl border border-blue-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><BookOpen size={19} className="text-blue-600"/><h2 className="font-bold text-slate-900">{editingId ? 'Edit Course' : 'Create Course'}</h2></div><button type="button" onClick={closeForm} aria-label="Close course form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div><form onSubmit={saveCourse} className="grid gap-4 md:grid-cols-2"><Input label="Course title" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Introduction to Data Science"/><Input label="Category" required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Computer Science"/><Input label="Thumbnail URL" value={draft.thumbnail} onChange={(event) => setDraft({ ...draft, thumbnail: event.target.value })} placeholder="https://…"/><div className="hidden md:block"/><label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">Description<textarea required rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/></label><div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="secondary" disabled={busy} onClick={closeForm}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create course'}</Button></div></form></section>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Course Library</h2><p className="mt-1 text-xs text-slate-500">{visible.length} {visible.length === 1 ? 'course' : 'courses'}</p></div><div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((course) => <article key={course.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="h-36 bg-slate-100">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }}/>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{course.category}</span><h3 className="mt-3 line-clamp-2 font-bold text-slate-900">{course.title}</h3></div><span className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">{course.code}</span></div><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{course.description}</p><p className="mt-3 text-xs text-slate-500">{course.students} students · {course.lessons.length} lessons</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><Link to={`/instructor/courses/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"><Eye size={16}/>View Course</Link><div className="flex gap-1"><button onClick={() => editCourse(course)} aria-label={`Edit ${course.title}`} title="Edit course" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16}/></button><button onClick={() => deleteCourse(course)} aria-label={`Delete ${course.title}`} title="Delete course" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div></div></div></article>)}{visible.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">No courses match your search and filters.</p>}</div></section>
  </div>;
}

export default InstructorCourses;
