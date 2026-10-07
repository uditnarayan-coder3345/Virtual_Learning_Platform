import { useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import CourseCard from '../../components/course/CourseCard';
import { useStudent } from '../../context/StudentContext';
import { courseCatalog } from '../../utils/mockData';

function BrowseCourses() {
  const { isEnrolled } = useStudent();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [semester, setSemester] = useState('All semesters');
  const categories = [...new Set(courseCatalog.map((course) => course.category))];
  const semesters = [...new Set(courseCatalog.map((course) => course.semester))];
  const filteredCourses = useMemo(() => courseCatalog.filter((course) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${course.title} ${course.code} ${course.instructor} ${course.category}`.toLowerCase().includes(query);
    return matchesSearch && (category === 'All categories' || course.category === category) && (semester === 'All semesters' || course.semester === semester);
  }), [search, category, semester]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All categories');
    setSemester('All semesters');
  };

  return (
    <div>
      <PageHeading title="Browse Courses" description="Explore courses from your academic program and find your next area of focus." />
      <section aria-label="Course filters" className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(170px,220px)_minmax(150px,190px)_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Search courses</span>
            <span className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <Search size={17} aria-hidden="true" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Course, code, or instructor" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Semester</span>
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option>All semesters</option>{semesters.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <Button variant="secondary" className="w-full md:w-auto" onClick={resetFilters}><RotateCcw size={16} /> Reset</Button>
        </div>
      </section>

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500"><span className="font-semibold text-slate-800">{filteredCourses.length}</span> available courses</p>
      </div>
      {filteredCourses.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => <CourseCard key={course.id} course={course} enrolled={isEnrolled(course.id)} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p className="font-semibold text-slate-800">No courses match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Try another search or reset the filters.</p>
          <Button variant="secondary" className="mt-4" onClick={resetFilters}>Reset filters</Button>
        </div>
      )}
    </div>
  );
}

export default BrowseCourses;