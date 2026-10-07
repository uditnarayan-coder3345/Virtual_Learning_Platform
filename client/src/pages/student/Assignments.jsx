import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import PageHeading from '../../components/common/PageHeading';
import AssignmentCard from '../../components/assignment/AssignmentCard';
import { assignments } from '../../utils/mockData';

const filters = ['All', 'Pending', 'Submitted', 'Graded'];

function Assignments() {
  const [status, setStatus] = useState('All');
  const [course, setCourse] = useState('All courses');
  const [search, setSearch] = useState('');
  const courses = [...new Set(assignments.map((assignment) => assignment.course))];
  const counts = {
    All: assignments.length,
    Pending: assignments.filter((item) => item.status === 'Pending').length,
    Submitted: assignments.filter((item) => item.status === 'Submitted').length,
    Graded: assignments.filter((item) => item.status === 'Graded').length,
  };
  const filtered = useMemo(() => assignments.filter((assignment) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || `${assignment.title} ${assignment.course}`.toLowerCase().includes(query);
    return matchesQuery && (status === 'All' || assignment.status === status) && (course === 'All courses' || assignment.course === course);
  }), [search, status, course]);

  return (
    <div>
      <PageHeading title="Assignments" description="Keep track of upcoming work, submissions, and instructor feedback." />
      <section aria-label="Assignment statistics" className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {filters.map((item) => (
          <button key={item} type="button" onClick={() => setStatus(item)} aria-pressed={status === item} className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-colors sm:p-5 ${status === item ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}>
            <p className="text-xs font-medium text-slate-500">{item === 'All' ? 'Total assignments' : item}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{counts[item]}</p>
          </button>
        ))}
      </section>

      <section className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_240px]">
        <label className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assignments" aria-label="Search assignments" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
        </label>
        <select value={course} onChange={(event) => setCourse(event.target.value)} aria-label="Filter by course" className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
          <option>All courses</option>{courses.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-500"><span>Assignments</span><span>{filtered.length} shown</span></div>
      {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)}</div> : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p className="font-semibold text-slate-800">No assignments found</p><p className="mt-1 text-sm text-slate-500">Try changing the status, course, or search.</p></div>
      )}
    </div>
  );
}

export default Assignments;