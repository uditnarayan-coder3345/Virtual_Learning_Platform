import { Router } from 'express';
import {
  completeLesson,
  getAssignment,
  getCourse,
  getCourseAssignments,
  getCourseLessons,
  getCourseProgress,
  getCourseQuizzes,
  getCurrentStudentProfile,
  getDashboard,
  getQuiz,
  getQuizResults,
  getStudentCourses,
  getStudentEnrollments,
  submitAssignment,
  submitQuiz,
  updateStudentProfile,
  enrollInCourse,
} from '../controllers/studentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { createStudentReport, getStudentReport, getStudentReports } from '../controllers/reportController.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('STUDENT'));

router.get('/profile', getCurrentStudentProfile);
router.put('/profile', updateStudentProfile);
router.post('/reports', createStudentReport);
router.get('/reports', getStudentReports);
router.get('/reports/:reportId', getStudentReport);

router.get('/courses', getStudentCourses);
router.get('/courses/:courseId', getCourse);
router.post('/courses/:courseId/enroll', enrollInCourse);
router.get('/enrollments', getStudentEnrollments);
router.get('/courses/:courseId/lessons', getCourseLessons);
router.post('/lessons/:lessonId/complete', completeLesson);
router.get('/courses/:courseId/progress', getCourseProgress);
router.get('/courses/:courseId/assignments', getCourseAssignments);
router.get('/assignments/:assignmentId', getAssignment);
router.post('/assignments/:assignmentId/submit', submitAssignment);
router.get('/courses/:courseId/quizzes', getCourseQuizzes);
router.get('/quizzes/:quizId', getQuiz);
router.post('/quizzes/:quizId/submit', submitQuiz);
router.get('/quizzes/:quizId/results', getQuizResults);

router.get('/dashboard', getDashboard);

export default router;
