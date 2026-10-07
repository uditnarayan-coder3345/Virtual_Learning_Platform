import { ArrowUpRight, BookOpen, Clock3, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';

function CourseCard({ course, enrolled = false }) {
  const navigate = useNavigate();
  const progress = course.progress ?? 0;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => navigate(`/student/courses/${course.id}`)} className="group relative block h-40 w-full overflow-hidden bg-slate-100 text-left" aria-label={`View ${course.title}`}>
        <img src={course.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700">{course.category}</span>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-blue-700"><BookOpen size={18} /></span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">{course.code}</span>
          <StatusBadge status={enrolled ? (progress >= 100 ? 'Completed' : 'Active') : 'Available'} />
        </div>
        <h2 className="mt-2 text-base font-bold leading-6 text-slate-900">{course.title}</h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{course.shortDescription}</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><GraduationCap size={16} className="shrink-0 text-slate-400" />{course.instructor}</div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Clock3 size={15} />{course.lessonCount} lessons <span className="text-slate-300">·</span>{course.semester}</div>
        {enrolled && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-500">Course progress</span><span className="font-semibold text-slate-700">{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <Button className="mt-5 w-full" variant={enrolled ? 'primary' : 'secondary'} onClick={() => navigate(enrolled ? `/student/courses/${course.id}/learn` : `/student/courses/${course.id}`)}>
          {enrolled ? 'Go to Course' : 'Enroll Now'} <ArrowUpRight size={16} />
        </Button>
      </div>
    </article>
  );
}

export default CourseCard;