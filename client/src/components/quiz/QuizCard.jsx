import { ArrowUpRight, CircleHelp, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';

function QuizCard({ quiz }) {
  const navigate = useNavigate();
  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><CircleHelp size={19} /></span>
        <StatusBadge status={quiz.status} />
      </div>
      <h2 className="mt-4 text-base font-bold leading-6 text-slate-900">{quiz.title}</h2>
      <p className="mt-1 text-sm text-slate-500">{quiz.course}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>{quiz.questionCount} questions</span><span>{quiz.totalMarks} marks</span>
        <span className="inline-flex items-center gap-1"><Clock3 size={14} />{quiz.durationMinutes} min</span>
      </div>
      {quiz.previousScore !== null && <p className="mt-3 text-sm text-slate-600">Previous score <span className="font-bold text-emerald-700">{quiz.previousScore}/{quiz.totalMarks}</span></p>}
      <Button className="mt-5 w-full" variant={quiz.status === 'Available' ? 'primary' : 'secondary'} onClick={() => navigate(`/student/quizzes/${quiz.id}`)}>
        {quiz.status === 'Available' ? 'Attempt Quiz' : 'Review Quiz'} <ArrowUpRight size={16} />
      </Button>
    </article>
  );
}

export default QuizCard;