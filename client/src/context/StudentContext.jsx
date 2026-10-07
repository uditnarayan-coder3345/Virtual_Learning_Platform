import { createContext, useContext, useMemo, useState } from 'react';
import { courseCatalog } from '../utils/mockData';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressByCourse, setProgressByCourse] = useState({});

  const enrollCourse = (courseId) => setEnrolledCourseIds((current) => current.includes(courseId) ? current : [...current, courseId]);
  const isEnrolled = (courseId) => enrolledCourseIds.includes(courseId);
  const getCourseProgress = (courseId) => progressByCourse[courseId] ?? 0;
  const isLessonCompleted = (courseId, lessonId) => completedLessons.includes(`${courseId}:${lessonId}`);
  const completeLesson = (courseId, lessonId) => {
    const lessonKey = `${courseId}:${lessonId}`;
    if (completedLessons.includes(lessonKey)) return;
    setCompletedLessons((current) => current.includes(lessonKey) ? current : [...current, lessonKey]);
    setProgressByCourse((progress) => {
      const course = courseCatalog.find((item) => item.id === courseId);
      const increment = course ? Math.ceil(100 / course.lessonCount) : 1;
      return { ...progress, [courseId]: Math.min(100, (progress[courseId] ?? 0) + increment) };
    });
  };

  const value = useMemo(() => ({ enrolledCourseIds, enrollCourse, isEnrolled, getCourseProgress, isLessonCompleted, completeLesson }), [enrolledCourseIds, completedLessons, progressByCourse]);
  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used within a StudentProvider');
  return context;
}
