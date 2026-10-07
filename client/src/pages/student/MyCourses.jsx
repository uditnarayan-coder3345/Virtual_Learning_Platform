import { ArrowRight, BookOpenCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import CourseCard from '../../components/course/CourseCard';
import { useStudent } from '../../context/StudentContext';
import { courseCatalog } from '../../utils/mockData';

function MyCourses() {
  const { enrolledCourseIds, isEnrolled, getCourseProgress } = useStudent();
  const enrolledCourses = courseCatalog.filter((course) => enrolledCourseIds.includes(course.id)).map((course) => ({ ...course, progress: getCourseProgress(course.id) }));

  return (
    <div>
      <PageHeading
        title="My Courses"
        description="Your enrolled courses and learning progress for this academic session."
        action={<Link to="/student/browse-courses" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><BookOpenCheck size={17} />Browse Courses</Link>}
      />
      <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5">
        <div><p className="text-sm font-semibold text-slate-800">Course overview</p><p className="mt-0.5 text-xs text-slate-500">{enrolledCourses.length} enrolled courses</p></div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">{enrolledCourses.filter((course) => getCourseProgress(course.id) < 100).length} active <ArrowRight size={15} /></span>
      </div>
      {enrolledCourses.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {enrolledCourses.map((course) => <CourseCard key={course.id} course={course} enrolled={isEnrolled(course.id)} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="font-semibold text-slate-800">You have not enrolled in a course yet</h2>
          <p className="mt-1 text-sm text-slate-500">Browse the catalog to find a course for your program.</p>
          <Link to="/student/browse-courses" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Browse Courses</Link>
        </div>
      )}
    </div>
  );
}

export default MyCourses;