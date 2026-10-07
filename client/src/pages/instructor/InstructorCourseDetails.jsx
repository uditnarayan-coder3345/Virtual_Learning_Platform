import { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Eye, FileText, Pencil, Plus, Trash2, UsersRound, X } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Dialog from '../../components/common/Dialog';
import PageHeading from '../../components/common/PageHeading';
import StatusBadge from '../../components/common/StatusBadge';
import { useInstructorData } from '../../context/InstructorContext';

const sections = [
  { key: 'lessons', label: 'Lessons', icon: BookOpen, fields: [{ key: 'title', label: 'Lesson title', required: true }, { key: 'duration', label: 'Duration (minutes)', type: 'number' }, { key: 'content', label: 'Lesson content', type: 'textarea', required: true }] },
  { key: 'assignments', label: 'Assignments', icon: FileText, fields: [{ key: 'title', label: 'Assignment title', required: true }, { key: 'dueDate', label: 'Due date', type: 'date', required: true }, { key: 'totalMarks', label: 'Total marks', type: 'number', required: true }, { key: 'description', label: 'Instructions', type: 'textarea', required: true }] },
  { key: 'quizzes', label: 'Quizzes', icon: CheckCircle2, fields: [{ key: 'title', label: 'Quiz title', required: true }, { key: 'totalMarks', label: 'Total marks', type: 'number', required: true }, { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number' }, { key: 'description', label: 'Description', type: 'textarea' }] },
];
const emptyQuestion = { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' };
const makeId = () => `demo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const sampleResults = [
  { name: 'Aarav Mehta', score: 22, total: 25, attemptedAt: 'Sep 28, 2026' },
  { name: 'Sana Iqbal', score: 19, total: 25, attemptedAt: 'Sep 27, 2026' },
  { name: 'Riya Sen', score: 24, total: 25, attemptedAt: 'Sep 26, 2026' },
];

function InstructorCourseDetails() {
  const { id } = useParams();
  const { courses, setCourses } = useInstructorData();
  const course = courses.find((item) => item.id === id) ?? (id === '1' ? courses[0] : null);
  const [activeSection, setActiveSection] = useState('lessons');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [viewingLesson, setViewingLesson] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [grading, setGrading] = useState(null);
  const [gradeDraft, setGradeDraft] = useState({ marks: '', feedback: '' });
  const [questionQuiz, setQuestionQuiz] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showResults, setShowResults] = useState(null);
  const [notice, setNotice] = useState('');
  const section = sections.find((item) => item.key === activeSection);
  const rows = course?.[activeSection] ?? [];
  const totalSubmissions = useMemo(() => course?.assignments.reduce((sum, item) => sum + item.submissions.length, 0) ?? 0, [course]);

  if (!course) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><p className="font-semibold text-slate-800">Course not found</p><Link to="/instructor/courses" className="mt-3 inline-block text-sm font-semibold text-blue-700">Back to courses</Link></div>;

  const patchCourse = (updater) => setCourses((current) => current.map((item) => item.id === course.id ? updater(item) : item));
  const resetEditor = () => { setEditing(null); setDraft({}); };
  const startEdit = (item) => { setEditing(item); setDraft({ ...item, ...(activeSection === 'assignments' ? { dueDate: item.dueDate?.slice(0, 10) || '' } : {}) }); };
  const saveItem = (event) => {
    event.preventDefault();
    const value = { ...draft, id: editing?.id || makeId() };
    if (activeSection === 'assignments' && !editing) value.submissions = [];
    if (activeSection === 'quizzes' && !editing) value.questions = [];
    patchCourse((current) => ({ ...current, [activeSection]: editing ? current[activeSection].map((item) => item.id === editing.id ? value : item) : [value, ...current[activeSection]] }));
    setNotice(`${section.label.slice(0, -1)} saved to this demo.`);
    resetEditor();
  };
  const deleteItem = (item) => {
    if (!window.confirm(`Delete “${item.title}” from this demo course?`)) return;
    patchCourse((current) => ({ ...current, [activeSection]: current[activeSection].filter((row) => row.id !== item.id) }));
    setNotice(`${section.label.slice(0, -1)} removed from this demo.`);
  };
  const openGrade = (assignment, submission) => { setGrading({ assignment, submission }); setGradeDraft({ marks: submission.marks ?? '', feedback: submission.feedback ?? '' }); };
  const saveGrade = (event) => {
    event.preventDefault();
    const { assignment, submission } = grading;
    patchCourse((current) => ({ ...current, assignments: current.assignments.map((item) => item.id === assignment.id ? { ...item, submissions: item.submissions.map((entry) => entry.id === submission.id ? { ...entry, marks: Number(gradeDraft.marks), feedback: gradeDraft.feedback } : entry) } : item) }));
    setNotice(`Feedback saved for ${submission.student}.`);
    setGrading(null);
  };
  const openQuestion = (quiz, question = null) => { setQuestionQuiz(quiz); setEditingQuestion(question); setQuestionDraft(question ? { ...question } : emptyQuestion); };
  const saveQuestion = (event) => {
    event.preventDefault();
    patchCourse((current) => ({ ...current, quizzes: current.quizzes.map((quiz) => quiz.id === questionQuiz.id ? { ...quiz, questions: editingQuestion ? quiz.questions.map((item) => item.id === editingQuestion.id ? { ...questionDraft, id: editingQuestion.id } : item) : [...quiz.questions, { ...questionDraft, id: makeId() }] } : quiz) }));
    setNotice('Quiz question saved to this demo.');
    setQuestionQuiz(null);
  };
  const deleteQuestion = (quiz, question) => {
    if (!window.confirm('Delete this question from the demo quiz?')) return;
    patchCourse((current) => ({ ...current, quizzes: current.quizzes.map((item) => item.id === quiz.id ? { ...item, questions: item.questions.filter((row) => row.id !== question.id) } : item) }));
  };

  return <div>
    <Link to="/instructor/courses" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"><ArrowLeft size={16}/>Back to courses</Link>
    <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{course.thumbnail && <img src={course.thumbnail} alt="" className="h-44 w-full object-cover sm:h-56"/>}<div className="p-5 sm:p-6"><PageHeading eyebrow="Course overview" title={course.title} description={course.description}/><div className="flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{course.category}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{course.code}</span><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><UsersRound size={13}/>{course.students} students</span></div></div></section>
    {notice && <div role="status" className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss" className="p-1"><X size={16}/></button></div>}
    <div className="mb-5 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm" role="tablist" aria-label="Course content sections">{sections.map(({ key, label, icon: Icon }) => <button key={key} role="tab" aria-selected={activeSection === key} onClick={() => { setActiveSection(key); resetEditor(); }} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold ${activeSection === key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={17}/>{label}<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{course[key].length}</span></button>)}</div>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Course content</p><h2 className="mt-1 text-lg font-bold text-slate-900">{section.label}</h2></div><Button onClick={() => { setEditing(null); setDraft({}); }}><Plus size={17}/>Add {section.label.slice(0, -1)}</Button></div>
      <form onSubmit={saveItem} className="mb-5 grid gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2">{section.fields.map((field) => <label key={field.key} className={`space-y-1 text-xs font-semibold text-slate-600 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>{field.label}{field.type === 'textarea' ? <textarea rows={3} required={field.required} value={draft[field.key] || ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400"/> : <input type={field.type || 'text'} min={field.type === 'number' ? '1' : undefined} required={field.required} value={draft[field.key] || ''} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-400"/>}</label>)}<div className="flex justify-end gap-2 sm:col-span-2">{editing && <Button type="button" variant="secondary" onClick={resetEditor}>Cancel edit</Button>}<Button type="submit">{editing ? 'Save changes' : `Add ${section.label.slice(0, -1)}`}</Button></div></form>
      {rows.length === 0 ? <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No {section.label.toLowerCase()} yet. Use the form above to add one.</p> : <div className="divide-y divide-slate-100">{rows.map((item, index) => <article key={item.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{section.label.slice(0, -1)} {String(index + 1).padStart(2, '0')}</p><h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description || item.content || `${item.totalMarks} marks · ${item.questions?.length || 0} questions`}</p></div><div className="flex shrink-0 items-center gap-1">{activeSection === 'lessons' && <button onClick={() => setViewingLesson(item)} aria-label={`View ${item.title}`} title="View lesson" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye size={16}/></button>}{activeSection === 'assignments' && <button onClick={() => setReviewing(item)} aria-label={`View submissions for ${item.title}`} title="View submissions" className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><UsersRound size={16}/></button>}{activeSection === 'quizzes' && <button onClick={() => setShowResults(item)} aria-label={`View results for ${item.title}`} title="View results" className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"><Eye size={16}/></button>}<button onClick={() => startEdit(item)} aria-label={`Edit ${item.title}`} title="Edit" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700"><Pencil size={16}/></button><button onClick={() => deleteItem(item)} aria-label={`Delete ${item.title}`} title="Delete" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div></div>
        {activeSection === 'assignments' && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{item.submissions.length} submissions</span><span>·</span><span>Due {new Date(`${item.dueDate.slice(0, 10)}T00:00:00`).toLocaleDateString()}</span><Button variant="secondary" className="min-h-8 px-3 py-1 text-xs" onClick={() => setReviewing(item)}>View submissions / grade</Button></div>}
        {activeSection === 'quizzes' && <div className="mt-4 rounded-lg bg-slate-50 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h4 className="text-sm font-semibold text-slate-800">Questions</h4><p className="text-xs text-slate-500">{item.questions?.length || 0} questions · {item.totalMarks} total marks</p></div><div className="flex gap-2"><Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => setShowResults(item)}><Eye size={14}/>View results</Button><Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => openQuestion(item)}><Plus size={14}/>Add question</Button></div></div>{(item.questions || []).map((question, questionIndex) => <div key={question.id} className="border-t border-slate-200 py-3 first:border-0"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-slate-800"><span className="mr-2 text-slate-400">{questionIndex + 1}.</span>{question.question}</p><div className="flex shrink-0 gap-1"><button onClick={() => openQuestion(item, question)} aria-label="Edit question" className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-blue-700"><Pencil size={14}/></button><button onClick={() => deleteQuestion(item, question)} aria-label="Delete question" className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-red-600"><Trash2 size={14}/></button></div></div><div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">{['A', 'B', 'C', 'D'].map((letter) => <p key={letter} className={question.correctAnswer === letter ? 'font-semibold text-emerald-700' : ''}>{letter}. {question[`option${letter}`]}{question.correctAnswer === letter ? ' · Correct answer' : ''}</p>)}</div></div>)}</div>}
      </article>)}</div>}
    </section>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">{[{ label: 'Lessons', value: course.lessons.length }, { label: 'Submissions', value: totalSubmissions }, { label: 'Quiz questions', value: course.quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0) }].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p></div>)}</div>

    {viewingLesson && <Dialog title={viewingLesson.title} eyebrow="Lesson preview" onClose={() => setViewingLesson(null)}><p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{viewingLesson.content}</p>{viewingLesson.duration && <p className="mt-4 text-xs font-medium text-slate-400">{viewingLesson.duration} minutes</p>}</Dialog>}
    {reviewing && <Dialog title={reviewing.title} eyebrow="Assignment submissions" onClose={() => setReviewing(null)}><p className="mb-4 text-sm text-slate-500">{reviewing.submissions.length} learner submissions</p><div className="divide-y divide-slate-100">{reviewing.submissions.map((submission) => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-semibold text-slate-800">{submission.student}</p><p className="text-xs text-slate-500">{submission.email} · {new Date(submission.submittedAt).toLocaleDateString()}</p>{submission.feedback && <p className="mt-1 text-xs text-slate-600">Feedback: {submission.feedback}</p>}</div><div className="flex items-center gap-2">{submission.marks == null ? <StatusBadge status="Pending"/> : <span className="text-sm font-semibold text-emerald-700">{submission.marks}/{reviewing.totalMarks}</span>}<Button variant="secondary" className="min-h-9 px-3 py-1.5 text-xs" onClick={() => openGrade(reviewing, submission)}>{submission.marks == null ? 'Grade' : 'Edit feedback'}</Button></div></div>)}{reviewing.submissions.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No submissions yet.</p>}</div></Dialog>}
    {grading && <Dialog title={grading.submission.student} eyebrow={`Grade · ${grading.assignment.title}`} onClose={() => setGrading(null)}><form onSubmit={saveGrade} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Marks (out of {grading.assignment.totalMarks})<input type="number" min="0" max={grading.assignment.totalMarks} required value={gradeDraft.marks} onChange={(event) => setGradeDraft({ ...gradeDraft, marks: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-400"/></label><label className="block text-sm font-medium text-slate-700">Feedback<textarea rows={4} value={gradeDraft.feedback} onChange={(event) => setGradeDraft({ ...gradeDraft, feedback: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-400" placeholder="Share feedback with the student"/></label><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setGrading(null)}>Cancel</Button><Button type="submit">Save grade</Button></div></form></Dialog>}
    {questionQuiz && <Dialog title={questionQuiz.title} eyebrow={`${editingQuestion ? 'Edit' : 'Add'} quiz question`} onClose={() => setQuestionQuiz(null)}><form onSubmit={saveQuestion} className="space-y-3"><label className="block text-sm font-medium text-slate-700">Question<textarea required rows={2} value={questionDraft.question} onChange={(event) => setQuestionDraft({ ...questionDraft, question: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-400"/></label>{['A', 'B', 'C', 'D'].map((letter) => <label key={letter} className="block text-sm font-medium text-slate-700">Option {letter}<input required value={questionDraft[`option${letter}`]} onChange={(event) => setQuestionDraft({ ...questionDraft, [`option${letter}`]: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-400"/></label>)}<label className="block text-sm font-medium text-slate-700">Correct answer<select value={questionDraft.correctAnswer} onChange={(event) => setQuestionDraft({ ...questionDraft, correctAnswer: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3">{['A', 'B', 'C', 'D'].map((letter) => <option key={letter} value={letter}>Option {letter}</option>)}</select></label><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setQuestionQuiz(null)}>Cancel</Button><Button type="submit">Save question</Button></div></form></Dialog>}
    {showResults && <Dialog title={showResults.title} eyebrow="Quiz results" onClose={() => setShowResults(null)}><p className="mb-3 text-sm text-slate-500">Recent sample results · {showResults.totalMarks} total marks</p><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-400"><tr><th className="py-2 pr-4">Student</th><th className="py-2 pr-4">Score</th><th className="py-2">Attempted</th></tr></thead><tbody className="divide-y divide-slate-100">{sampleResults.map((result) => <tr key={result.name}><td className="py-3 pr-4 font-medium text-slate-800">{result.name}</td><td className="py-3 pr-4 font-semibold text-emerald-700">{result.score}/{showResults.totalMarks}</td><td className="py-3 text-slate-500">{result.attemptedAt}</td></tr>)}</tbody></table></div></Dialog>}
  </div>;
}

export default InstructorCourseDetails;
