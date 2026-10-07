import { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import Input from '../../components/common/Input';
import PageHeading from '../../components/common/PageHeading';
import { useInstructorData } from '../../context/InstructorContext';

const emptyQuiz = { title: '', description: '', courseId: '', totalMarks: 20, durationMinutes: 20 };
const emptyQuestion = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' };
const newId = () => `instructor-quiz-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
const results = [
  { name: 'Aarav Mehta', score: 22, attemptedAt: 'Sep 28, 2026' },
  { name: 'Sana Iqbal', score: 19, attemptedAt: 'Sep 27, 2026' },
  { name: 'Riya Sen', score: 24, attemptedAt: 'Sep 26, 2026' },
];

function InstructorQuizzes() {
  const { courses, setCourses } = useInstructorData();
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [draft, setDraft] = useState(emptyQuiz);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [managing, setManaging] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewResults, setViewResults] = useState(null);
  const allQuizzes = useMemo(() => courses.flatMap((course) => course.quizzes.map((quiz) => ({ ...quiz, courseId: course.id, courseTitle: course.title }))), [courses]);
  const visible = allQuizzes.filter((quiz) => (courseFilter === 'ALL' || quiz.courseId === courseFilter)
    && `${quiz.title} ${quiz.courseTitle}`.toLowerCase().includes(search.trim().toLowerCase()));

  const reset = () => { setDraft({ ...emptyQuiz, courseId: courses[0]?.id ?? '' }); setEditing(null); };
  const startEdit = (quiz) => { setEditing(quiz); setDraft({ title: quiz.title, description: quiz.description || '', courseId: quiz.courseId, totalMarks: quiz.totalMarks, durationMinutes: quiz.durationMinutes || 20 }); };
  const saveQuiz = (event) => {
    event.preventDefault();
    const selectedCourse = courses.find((course) => course.id === draft.courseId);
    if (!selectedCourse) return;
    const existing = allQuizzes.find((quiz) => quiz.id === editing?.id);
    if (editing && existing && existing.courseId !== draft.courseId) {
      setCourses((current) => current.map((course) => ({ ...course, quizzes: course.quizzes.filter((quiz) => quiz.id !== editing.id) }))); 
    }
    const quiz = { ...draft, totalMarks: Number(draft.totalMarks), durationMinutes: Number(draft.durationMinutes), id: editing?.id || newId(), questions: editing?.questions || [] };
    setCourses((current) => current.map((course) => course.id === draft.courseId ? { ...course, quizzes: editing ? [...course.quizzes.filter((item) => item.id !== quiz.id), quiz] : [quiz, ...course.quizzes] } : course));
    setNotice(editing ? 'Quiz updated in this demo.' : 'Quiz created in this demo.');
    reset();
  };
  const deleteQuiz = (quiz) => {
    if (!window.confirm(`Delete “${quiz.title}” from this demo?`)) return;
    setCourses((current) => current.map((course) => ({ ...course, quizzes: course.quizzes.filter((item) => item.id !== quiz.id) })));
    setNotice('Quiz deleted from this demo.');
    if (managing?.id === quiz.id) setManaging(null);
  };
  const saveQuestion = (event) => {
    event.preventDefault();
    const question = { ...questionDraft, id: editingQuestion?.id || newId() };
    setCourses((current) => current.map((course) => ({ ...course, quizzes: course.quizzes.map((quiz) => quiz.id !== managing.id ? quiz : {
      ...quiz,
      questions: editingQuestion ? quiz.questions.map((item) => item.id === editingQuestion.id ? question : item) : [...quiz.questions, question],
    }) })));
    const updatedQuiz = { ...managing, questions: editingQuestion ? managing.questions.map((item) => item.id === editingQuestion.id ? question : item) : [...managing.questions, question] };
    setManaging(updatedQuiz);
    setQuestionDraft(emptyQuestion);
    setEditingQuestion(null);
  };
  const deleteQuestion = (quiz, question) => {
    if (!window.confirm('Delete this question from the demo quiz?')) return;
    const updatedQuiz = { ...quiz, questions: quiz.questions.filter((item) => item.id !== question.id) };
    setCourses((current) => current.map((course) => ({ ...course, quizzes: course.quizzes.map((item) => item.id === quiz.id ? updatedQuiz : item) })));
    setManaging(updatedQuiz);
  };

  return <div>
    <PageHeading eyebrow="Assessment workspace" title="Quizzes" description="Create quizzes, manage questions, and review sample student results." />
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Plus size={18}/></span><div><h2 className="font-bold text-slate-900">{editing ? 'Edit Quiz' : 'Create Quiz'}</h2><p className="text-xs text-slate-500">Changes are held in local demo state.</p></div></div><form onSubmit={saveQuiz} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Input label="Quiz title" required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Module knowledge check"/><label className="space-y-1.5 text-sm font-medium text-slate-700">Course<select required value={draft.courseId} onChange={(event) => setDraft({ ...draft, courseId: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3"><option value="" disabled>Select a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><Input label="Total marks" type="number" min="1" required value={draft.totalMarks} onChange={(event) => setDraft({ ...draft, totalMarks: event.target.value })}/><Input label="Duration (minutes)" type="number" min="1" value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: event.target.value })}/><label className="space-y-1.5 text-sm font-medium text-slate-700 md:col-span-2">Description<textarea rows={2} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500"/></label><div className="flex items-end justify-end gap-2">{editing && <Button type="button" variant="secondary" onClick={reset}>Cancel</Button>}<Button type="submit">{editing ? 'Save changes' : 'Create Quiz'}</Button></div></form></section>
    <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input aria-label="Search quizzes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search quizzes" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white"/></label><select aria-label="Filter quizzes by course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="ALL">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Quiz Library</h2><p className="mt-1 text-xs text-slate-500">{visible.length} quizzes</p></div><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold">Quiz</th><th className="px-5 py-3 font-semibold">Course</th><th className="px-5 py-3 font-semibold">Total marks</th><th className="px-5 py-3 font-semibold">Questions</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((quiz) => <tr key={quiz.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{quiz.title}</p><p className="mt-0.5 text-xs text-slate-500">{quiz.durationMinutes || 20} minutes</p></td><td className="px-5 py-4 text-slate-600">{quiz.courseTitle}</td><td className="px-5 py-4 font-medium text-slate-700">{quiz.totalMarks}</td><td className="px-5 py-4 text-slate-600">{quiz.questions.length}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => { setManaging(quiz); setEditingQuestion(null); setQuestionDraft(emptyQuestion); }} aria-label={`Manage questions for ${quiz.title}`} title="Manage questions" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><CheckCircle2 size={16}/></button><button onClick={() => startEdit(quiz)} aria-label={`Edit ${quiz.title}`} title="Edit quiz" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16}/></button><button onClick={() => setViewResults(quiz)} aria-label={`View results for ${quiz.title}`} title="View results" className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><BarChart3 size={16}/></button><button onClick={() => deleteQuiz(quiz)} aria-label={`Delete ${quiz.title}`} title="Delete quiz" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div></td></tr>)}{visible.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">No quizzes match these filters.</td></tr>}</tbody></table></div></section>
    {managing && <Dialog title={managing.title} eyebrow="Manage quiz questions" onClose={() => setManaging(null)}><form onSubmit={saveQuestion} className="mb-5 grid gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4"><label className="block text-sm font-medium text-slate-700">Question<textarea required rows={2} value={questionDraft.question} onChange={(event) => setQuestionDraft({ ...questionDraft, question: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-blue-400"/></label><div className="grid gap-3 sm:grid-cols-2">{['A', 'B', 'C', 'D'].map((letter) => <Input key={letter} label={`Option ${letter}`} required value={questionDraft[`option${letter}`]} onChange={(event) => setQuestionDraft({ ...questionDraft, [`option${letter}`]: event.target.value })}/>)}</div><label className="text-sm font-medium text-slate-700">Correct answer<select value={questionDraft.correctAnswer} onChange={(event) => setQuestionDraft({ ...questionDraft, correctAnswer: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3">{['A', 'B', 'C', 'D'].map((letter) => <option key={letter} value={letter}>Option {letter}</option>)}</select></label><div className="flex justify-end gap-2">{editingQuestion && <Button type="button" variant="secondary" onClick={() => { setEditingQuestion(null); setQuestionDraft(emptyQuestion); }}>Cancel edit</Button>}<Button type="submit">{editingQuestion ? 'Save question' : 'Add question'}</Button></div></form><div className="divide-y divide-slate-100">{managing.questions.map((question, index) => <article key={question.id} className="py-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-800">{index + 1}. {question.question}</p><div className="flex gap-1"><button onClick={() => { setEditingQuestion(question); setQuestionDraft({ ...question }); }} aria-label="Edit question" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50"><Pencil size={15}/></button><button onClick={() => deleteQuestion(managing, question)} aria-label="Delete question" className="rounded-lg p-2 text-slate-500 hover:bg-red-50"><Trash2 size={15}/></button></div></div><div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">{['A', 'B', 'C', 'D'].map((letter) => <p key={letter} className={letter === question.correctAnswer ? 'font-semibold text-emerald-700' : ''}>{letter}. {question[`option${letter}`]}{letter === question.correctAnswer ? ' · Correct' : ''}</p>)}</div></article>)}{managing.questions.length === 0 && <p className="py-5 text-center text-sm text-slate-500">No questions added yet.</p>}</div></Dialog>}
    {viewResults && <Dialog title={viewResults.title} eyebrow="Sample quiz results" onClose={() => setViewResults(null)}><p className="mb-3 text-sm text-slate-500">Recent demo attempts · {viewResults.totalMarks} total marks</p><table className="w-full text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="py-2">Student</th><th className="py-2">Score</th><th className="py-2">Attempted</th></tr></thead><tbody className="divide-y divide-slate-100">{results.map((result) => <tr key={result.name}><td className="py-3 font-medium text-slate-800">{result.name}</td><td className="py-3 font-semibold text-emerald-700">{result.score}/{viewResults.totalMarks}</td><td className="py-3 text-slate-500">{result.attemptedAt}</td></tr>)}</tbody></table></Dialog>}
  </div>;
}

export default InstructorQuizzes;
