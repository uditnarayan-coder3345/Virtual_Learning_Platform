import { CheckCircle2, Circle, Clock3, PlayCircle } from 'lucide-react';

function LessonCard({ lesson, active = false, completed = false, onClick }) {
  const StateIcon = completed ? CheckCircle2 : active ? PlayCircle : Circle;
  return (
    <button type="button" onClick={onClick} aria-current={active ? 'step' : undefined} className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${active ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-50'}`}>
      <StateIcon size={18} className={`mt-0.5 shrink-0 ${completed ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-slate-300'}`} />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium leading-5 ${active ? 'text-blue-800' : 'text-slate-700'}`}>{lesson.title}</span>
        <span className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Clock3 size={13} />{lesson.duration}</span>
      </span>
    </button>
  );
}

export default LessonCard;