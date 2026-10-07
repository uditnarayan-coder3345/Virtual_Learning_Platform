import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, PanelLeftClose } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import LessonCard from '../../components/course/LessonCard';
import { useStudent } from '../../context/StudentContext';
import { courseCatalog } from '../../utils/mockData';

function CourseLearning() {
  const { id } = useParams();
  const course = courseCatalog.find((item) => item.id === id);
  const { isEnrolled, isLessonCompleted, completeLesson, getCourseProgress } = useStudent();
  const lessonList = useMemo(() => course?.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title }))) ?? [], [course]);
  const [lessonId, setLessonId] = useState(lessonList[0]?.id ?? '');

  useEffect(() => setLessonId(lessonList[0]?.id ?? ''), [id]);

  if (!course) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-700">Course not found.</div>;
  if (!isEnrolled(course.id)) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><p className="font-semibold text-slate-800">Enroll to access course lessons.</p><Link to={`/student/courses/${course.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-700">View course details</Link></div>;

  const lessonIndex = lessonList.findIndex((lesson) => lesson.id === lessonId);
  const lesson = lessonList[Math.max(0, lessonIndex)];
  const completedCount = lessonList.filter((item) => isLessonCompleted(course.id, item.id)).length;
  const progress = getCourseProgress(course.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/student/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Course overview</Link>
        <p className="text-xs font-medium text-slate-500">{course.code} <span className="px-1">·</span>{progress}% complete</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Course syllabus</p>
            <h1 className="mt-1 text-base font-bold leading-6 text-slate-900">{course.title}</h1>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} /></div>
            <p className="mt-1.5 text-xs text-slate-500">{completedCount} of {lessonList.length} lessons completed</p>
          </div>
          <div className="max-h-[68vh] space-y-4 overflow-y-auto p-3">
            {course.modules.map((module, moduleIndex) => (
              <section key={module.id}>
                <h2 className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Module {moduleIndex + 1}: {module.title}</h2>
                <div className="space-y-1">{module.lessons.map((item) => <LessonCard key={item.id} lesson={item} active={lesson?.id === item.id} completed={isLessonCompleted(course.id, item.id)} onClick={() => setLessonId(item.id)} />)}</div>
              </section>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-700"><span>{lesson?.moduleTitle}</span><span className="text-slate-300">/</span><span>Lesson {lessonIndex + 1} of {lessonList.length}</span></div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{lesson?.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{course.instructor} <span className="px-1">·</span>{lesson?.duration}</p>
            <div className="mt-6 rounded-lg border border-slate-100 bg-[#fafbfe] p-5 sm:p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><PanelLeftClose size={17} className="text-blue-600" />Lesson content</div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{lesson?.content}</p>
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Key idea</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">Connect each concept to a concrete problem, then compare the trade-offs before choosing an implementation.</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold text-slate-900">Learning materials</h2>
            <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {lesson?.materials.map((material) => (
                <div key={material.name} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                  <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><FileText size={18} /></span><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{material.name}</p><p className="text-xs text-slate-400">PDF · {material.size}</p></div></div>
                  <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(lesson.content)}`} download={material.name.replace(/\.pdf$/i, '.txt')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Download size={15} />Download</a>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Button variant="secondary" disabled={lessonIndex <= 0} onClick={() => setLessonId(lessonList[lessonIndex - 1]?.id)}><ArrowLeft size={16} />Previous Lesson</Button>
            <Button variant={isLessonCompleted(course.id, lesson?.id) ? 'secondary' : 'primary'} onClick={() => completeLesson(course.id, lesson?.id)}>
              <CheckCircle2 size={16} />{isLessonCompleted(course.id, lesson?.id) ? 'Completed' : 'Mark as Completed'}
            </Button>
            <Button variant="secondary" disabled={lessonIndex >= lessonList.length - 1} onClick={() => setLessonId(lessonList[lessonIndex + 1]?.id)}>Next Lesson<ArrowRight size={16} /></Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CourseLearning;