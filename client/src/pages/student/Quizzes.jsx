import { useState } from 'react';
import PageHeading from '../../components/common/PageHeading';
import QuizCard from '../../components/quiz/QuizCard';

function Quizzes() {
  const [filter, setFilter] = useState('All');
  const quizzes = [];
  const filtered = quizzes.filter((quiz) => filter === 'All' || quiz.status === filter);
  const tabs = ['All', 'Available', 'Attempted'];

  return (
    <div>
      <PageHeading title="Quizzes" description="Check upcoming knowledge checks and review your recent attempts." />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Quiz status" className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={filter === tab} onClick={() => setFilter(tab)} className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${filter === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{tab}</button>)}
        </div>
        <p className="text-sm text-slate-500">{filtered.length} quizzes</p>
      </div>
      {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">No quizzes in this view.</div>}
    </div>
  );
}

export default Quizzes;
