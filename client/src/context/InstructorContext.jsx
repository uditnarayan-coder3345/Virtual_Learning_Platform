import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { getInstructorCourses } from '../services/instructorApi';

const InstructorContext = createContext(null);
export function InstructorProvider({ children }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    let active = true;
    if (user?.role !== 'INSTRUCTOR') { setCourses([]); return undefined; }
    getInstructorCourses()
      .then(({ courses: ownedCourses = [] }) => {
        if (active) setCourses(ownedCourses.map((course) => ({
          ...course,
          code: course.id.slice(0, 8).toUpperCase(),
          instructor: user.name,
          students: course._count?.enrollments ?? 0,
          lessons: course.lessons || [],
          assignments: course.assignments || [],
          quizzes: course.quizzes || [],
        })));
      })
      .catch(() => { if (active) setCourses([]); });
    return () => { active = false; };
  }, [user?.id, user?.role, user?.name]);
  const value = useMemo(() => ({ courses, setCourses }), [courses]);
  return <InstructorContext.Provider value={value}>{children}</InstructorContext.Provider>;
}

export function useInstructorData() {
  const context = useContext(InstructorContext);
  if (!context) throw new Error('useInstructorData must be used within InstructorProvider');
  return context;
}
