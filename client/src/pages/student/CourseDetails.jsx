import { ArrowLeft, BookOpen, CheckCircle2, Clock3, GraduationCap, Layers3 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useStudent } from '../../context/StudentContext';
import { courseCatalog } from '../../utils/mockData';

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courseCatalog.find((item) => item.id === id);
  const { enrollCourse, isEnrolled } = useStudent();

  if (!course) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-xl font-bold text-slate-900">Course not found</h1><Link to="/student/browse-courses" className="mt-4 inline-block text-sm font-semibold text-blue-700">Browse courses</Link></div>;

  const enrolled = isEnrolled(course.id);
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  const handleCourseAction = () => {
    if (enrolled) return navigate(`/student/courses/${course.id}/learn`);
    enrollCourse(course.id);
    navigate(`/student/courses/${course.id}/learn`);
  };

  return (
    <div>
      <Link to={enrolled ? '/student/courses' : '/student/browse-courses'} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />{enrolled ? 'My courses' : 'Browse courses'}</Link>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-52 bg-slate-100 sm:h-64">
          <img src={course.image} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          <span className="absolute bottom-4 left-4 rounded-md bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700">{course.category}</span>
        </div>
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_290px] lg:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wide text-blue-700">{course.code}</span><StatusBadge status={enrolled ? 'Active' : 'Available'} /></div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{course.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><GraduationCap size={17} />{course.instructor}</span>
              <span className="inline-flex items-center gap-2"><Layers3 size={17} />{course.semester}</span>
              <span className="inline-flex items-center gap-2"><BookOpen size={17} />{lessonCount} lessons</span>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">Course overview</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{course.overview}</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{course.description}</p>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">Course modules</h2>
              <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {course.modules.map((module, index) => (
                  <div key={module.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-500">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{module.title}</p><p className="mt-1 text-xs text-slate-500">{module.lessons.length} lessons</p></div></div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500"><Clock3 size={14} />{module.lessons.reduce((sum, lesson) => sum + Number.parseInt(lesson.duration, 10), 0)} min</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-800">{enrolled ? 'Your course' : 'Ready to begin?'}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{enrolled ? 'Pick up where you left off and continue through the course modules.' : `${lessonCount} lessons with downloadable learning materials.`}</p>
            {enrolled && <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 size={17} />Enrolled</div>}
            <Button className="mt-5 w-full" onClick={handleCourseAction}>{enrolled ? 'Continue Learning' : 'Enroll in Course'}</Button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;