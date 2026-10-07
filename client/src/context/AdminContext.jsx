import { createContext, useContext, useMemo, useState } from 'react';
import { assignments, courseCatalog, quizzes } from '../utils/mockData';

const AdminContext = createContext(null);
const STORAGE_KEY = 'vlp-admin-demo-data';

const seedUsers = [
  { id: 'u1', name: 'Alex Morgan', email: 'alex.morgan@college.edu', role: 'STUDENT', phone: '+1 (555) 014-7284', status: 'Active', joined: '2026-09-28', courses: 3 },
  { id: 'u2', name: 'Priya Sharma', email: 'priya.sharma@college.edu', role: 'STUDENT', phone: '+91 98765 43210', status: 'Active', joined: '2026-09-25', courses: 2 },
  { id: 'u3', name: 'Daniel Kim', email: 'daniel.kim@college.edu', role: 'STUDENT', phone: '+1 (555) 019-4432', status: 'Active', joined: '2026-09-21', courses: 4 },
  { id: 'u4', name: 'Dr. Nisha Verma', email: 'nisha.verma@college.edu', role: 'INSTRUCTOR', phone: '+91 98765 10203', status: 'Active', joined: '2026-09-18', courses: 2 },
  { id: 'u5', name: 'Prof. Rohan Desai', email: 'rohan.desai@college.edu', role: 'INSTRUCTOR', phone: '+91 98765 10204', status: 'Active', joined: '2026-09-15', courses: 1 },
  { id: 'u6', name: 'Maya Patel', email: 'maya.patel@college.edu', role: 'STUDENT', phone: '+91 98765 93210', status: 'Blocked', joined: '2026-09-12', courses: 1 },
  { id: 'u7', name: 'Dr. Kavita Iyer', email: 'kavita.iyer@college.edu', role: 'INSTRUCTOR', phone: '+91 98765 10205', status: 'Active', joined: '2026-09-10', courses: 1 },
];

function seedCourses() {
  return courseCatalog.slice(0, 5).map((course, index) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    thumbnail: course.image,
    instructor: course.instructor,
    enrollmentCount: [128, 96, 84, 72, 61][index],
    lessons: course.modules.flatMap((module) => module.lessons).map((lesson) => ({ id: lesson.id, title: lesson.title, content: lesson.content, duration: parseInt(lesson.duration, 10) || 20, materialUrl: '' })),
    assignments: assignments.filter((item) => item.courseId === course.id).map((item) => ({ id: item.id, title: item.title, description: item.description, dueDate: item.dueDate })),
    quizzes: quizzes.filter((item) => item.courseId === course.id).map((item) => ({
      id: item.id, title: item.title, description: `${item.title} knowledge check`, totalMarks: item.totalMarks,
      questions: [
        { id: `${item.id}-q1`, question: `Which concept is central to ${item.title}?`, optionA: 'Problem decomposition', optionB: 'Data visualization', optionC: 'User authentication', optionD: 'File compression', correctAnswer: 'A' },
        { id: `${item.id}-q2`, question: 'Which practice supports a reliable solution?', optionA: 'Skip validation', optionB: 'Test with representative cases', optionC: 'Duplicate all logic', optionD: 'Ignore edge cases', correctAnswer: 'B' },
      ],
    })),
  }));
}

function readSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.users) && Array.isArray(parsed.courses)) return parsed;
    }
  } catch { /* Use the in-memory demo seed when browser storage is unavailable. */ }
  return { users: seedUsers, courses: seedCourses() };
}

export function AdminProvider({ children }) {
  const [data, setData] = useState(readSavedData);
  const updateData = (updater) => setData((current) => {
    const next = typeof updater === 'function' ? updater(current) : updater;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* State remains usable for this session. */ }
    return next;
  });
  const value = useMemo(() => ({ ...data, setUsers: (users) => updateData((current) => ({ ...current, users: typeof users === 'function' ? users(current.users) : users })), setCourses: (courses) => updateData((current) => ({ ...current, courses: typeof courses === 'function' ? courses(current.courses) : courses })) }), [data]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdminData must be used within AdminProvider');
  return context;
}
