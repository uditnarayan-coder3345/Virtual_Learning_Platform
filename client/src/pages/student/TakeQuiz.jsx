import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Check, Clock3, Flag, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import { quizQuestions, quizzes } from '../../utils/mockData';

function TakeQuiz() {
  const { id } = useParams();
  const quiz = quizzes.find((item) => item.id === id);
  const questions = quizQuestions[id] ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewIds, setReviewIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState((quiz?.durationMinutes ?? 20) * 60);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted || timeLeft <= 0) {
      if (timeLeft <= 0) setSubmitted(true);
      return undefined;
    }
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [submitted, timeLeft]);

  if (!quiz) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="font-bold text-slate-900">Quiz not found</h1><Link to="/student/quizzes" className="mt-3 inline-block text-sm font-semibold text-blue-700">Back to quizzes</Link></div>;

  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const toggleReview = () => setReviewIds((current) => current.includes(question.id) ? current.filter((item) => item !== question.id) : [...current, question.id]);

  return (
    <div>
      <Link to="/student/quizzes" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700"><ArrowLeft size={16} />Back to quizzes</Link>
      <PageHeading title={quiz.title} description={`${quiz.course} · ${quiz.totalMarks} marks · ${questions.length} questions`} action={<span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${timeLeft < 120 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700'}`}><Clock3 size={16} />{submitted ? 'Submitted' : formattedTime}</span>} />

      {submitted ? (
        <section className="rounded-xl border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Check size={23} /></span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Quiz submitted</h2>
          <p className="mt-2 text-sm text-slate-500">Your answers were kept in this demo session. They have not been sent for grading.</p>
          <Link to="/student/quizzes" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Return to quizzes</Link>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">Question {currentIndex + 1} <span className="font-normal text-slate-400">of {questions.length}</span></p>
                <p className="text-xs text-slate-500">{answeredCount} answered</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${answeredCount / questions.length * 100}%` }} /></div>
              <h2 className="mt-7 text-lg font-bold leading-7 text-slate-900 sm:text-xl">{question.text}</h2>
              <fieldset className="mt-5 space-y-3">
                <legend className="sr-only">Answer options</legend>
                {question.options.map((option, index) => {
                  const selected = answers[question.id] === index;
                  return (
                    <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm transition-colors sm:p-4 ${selected ? 'border-blue-400 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                      <input type="radio" name={question.id} checked={selected} onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))} className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="flex-1">{option}</span>
                    </label>
                  );
                })}
              </fieldset>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <Button variant="secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => value - 1)}><ArrowLeft size={16} />Previous Question</Button>
                <Button variant="subtle" onClick={toggleReview}><Flag size={16} />{reviewIds.includes(question.id) ? 'Remove Review Flag' : 'Review Later'}</Button>
                <Button onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))} disabled={currentIndex === questions.length - 1}>Save & Next Question<ArrowRight size={16} /></Button>
              </div>
            </section>
            <div className="flex justify-end"><Button variant="secondary" onClick={() => setSubmitted(true)}><Send size={16} />Submit Quiz</Button></div>
          </main>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Question palette</h2>
            <p className="mt-1 text-xs text-slate-500">Select a number to move to that question.</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((item, index) => {
                const current = index === currentIndex;
                const answered = answers[item.id] !== undefined;
                const review = reviewIds.includes(item.id);
                return <button key={item.id} type="button" onClick={() => setCurrentIndex(index)} aria-label={`Question ${index + 1}${answered ? ', answered' : ', unvisited'}${review ? ', marked for review' : ''}`} className={`relative aspect-square rounded-lg border text-sm font-semibold ${current ? 'border-blue-600 bg-blue-600 text-white' : answered ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                  {index + 1}{review && <span className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${current ? 'bg-amber-300' : 'bg-amber-500'}`} />}
                </button>;
              })}
            </div>
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-blue-600" />Current question</p>
              <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-emerald-100 ring-1 ring-emerald-200" />Answered</p>
              <p className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-slate-300 bg-white" />Unvisited</p>
              <p className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Review later</p>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800"><AlertCircle size={15} className="mt-0.5 shrink-0" />Timer and answers are local to this page. No server evaluation is connected.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

export default TakeQuiz;