import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  Monitor,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const statIcons = { courses: BookOpen, progress: Clock3, assignments: FileText, results: Trophy };
const statTones = {
  blue: 'bg-blue-50 text-blue-700',
  violet: 'bg-violet-50 text-violet-700',
  amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
};
const courseIcons = { brackets: Braces, database: Database, web: Monitor };
const dueTones = { red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700' };

function SectionHeading({ eyebrow, title, action, to }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {action && <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">{action}<ArrowRight size={15} /></Link>}
    </div>
  );
}

function StudentDashboard() {
  const { user } = useAuth();
  const data = {
    academicSession: 'Academic session',
    stats: [
      { label: 'Enrolled courses', value: '00', note: 'No courses enrolled yet', icon: 'courses', tone: 'blue' },
      { label: 'In progress', value: '00', note: 'Your progress will appear here', icon: 'progress', tone: 'violet' },
      { label: 'Pending assignments', value: '00', note: 'No pending assignments', icon: 'assignments', tone: 'amber' },
      { label: 'Quiz average', value: '—', note: 'No completed quizzes yet', icon: 'results', tone: 'green' },
    ],
    courses: [],
    assignments: [],
    quizzes: [],
  };
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-700">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">Welcome back, {firstName}</h1>
          <p className="mt-1.5 text-sm text-slate-500">Here’s what’s happening with your learning today.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 sm:self-auto">
          <CalendarDays size={17} className="text-blue-600" />{data.academicSession}
        </div>
      </section>

      <section aria-label="Academic summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => {
          const Icon = statIcons[stat.icon];
          return (
            <article key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${statTones[stat.tone]}`}><Icon size={19} /></span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{stat.note}</p>
            </article>
          );
        })}
      </section>

      <section>
        <SectionHeading eyebrow="Keep learning" title="Courses in progress" action="All courses" to="/student/courses" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.courses.map((course) => {
            const Icon = courseIcons[course.icon];
            return (
              <article key={course.code} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${course.color}`}><Icon size={21} /></span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{course.code}</span>
                </div>
                <h3 className="mt-4 min-h-12 text-base font-bold leading-6 text-slate-900">{course.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{course.instructor}</p>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{course.lessons}</span>
                  <span className="font-semibold text-slate-700">{course.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={course.progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} />
                </div>
                <Link to={`/student/courses/${course.id}/learn`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800">Continue learning <ArrowUpRight size={15} /></Link>
              </article>
            );
          })}
          {data.courses.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">You are not enrolled in any courses yet. Browse the catalog to find a course.</p>}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionHeading eyebrow="Stay on track" title="Upcoming assignments" action="View assignments" to="/student/assignments" />
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
            {data.assignments.map((assignment) => (
              <article key={assignment.title} className="flex items-start gap-3.5 p-4 sm:items-center sm:p-5">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><FileText size={19} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{assignment.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{assignment.course} <span className="px-1">·</span> {assignment.due}</p>
                </div>
                <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${dueTones[assignment.tone]}`}>{assignment.status}</span>
              </article>
            ))}
            {data.assignments.length === 0 && <p className="p-5 text-sm text-slate-500">No upcoming assignments.</p>}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Your progress" title="Recent quiz performance" action="All results" to="/student/results" />
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {data.quizzes.map((quiz, index) => (
              <article key={quiz.title} className={`flex items-center gap-3.5 p-4 sm:p-5 ${index ? 'border-t border-slate-100' : ''}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><CircleHelp size={19} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{quiz.title}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{quiz.course} · {quiz.date}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-emerald-700"><CheckCircle2 size={15} />{quiz.score}%</span>
              </article>
            ))}
            {data.quizzes.length === 0 && <p className="p-5 text-sm text-slate-500">No quiz attempts yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;
