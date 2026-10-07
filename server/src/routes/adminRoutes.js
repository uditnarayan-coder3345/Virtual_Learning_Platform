import { Router } from 'express';
import {
  createAdminAssignment,
  createAdminCourse,
  createAdminLesson,
  createAdminQuiz,
  createAdminQuizQuestion,
  deleteAdminAssignment,
  deleteAdminCourse,
  deleteAdminLesson,
  deleteAdminQuiz,
  deleteAdminQuizQuestion,
  deleteAdminUser,
  approveAdminUser,
  rejectAdminUser,
  blockAdminUser,
  unblockAdminUser,
  getPendingAdminUsers,
  getAdminCourseAssignments,
  getAdminCourseById,
  getAdminCourseLessons,
  getAdminCourseQuizzes,
  getAdminCourses,
  getAdminDashboard,
  getAdminProfile,
  getAdminQuizQuestions,
  getAdminUserById,
  getAdminUsers,
  updateAdminAssignment,
  updateAdminCourse,
  updateAdminLesson,
  updateAdminProfile,
  updateAdminQuiz,
  updateAdminQuizQuestion,
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { getAdminReport, getAdminReports, updateAdminReport } from '../controllers/reportController.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/users/pending', getPendingAdminUsers);
router.get('/reports', getAdminReports);
router.get('/reports/:reportId', getAdminReport);
router.patch('/reports/:reportId', updateAdminReport);
router.patch('/users/:userId/approve', approveAdminUser);
router.patch('/users/:userId/reject', rejectAdminUser);
router.patch('/users/:userId/block', blockAdminUser);
router.patch('/users/:userId/unblock', unblockAdminUser);
router.get('/users', getAdminUsers);
router.get('/users/:userId', getAdminUserById);
router.delete('/users/:userId', deleteAdminUser);

router.get('/courses', getAdminCourses);
router.get('/courses/:courseId', getAdminCourseById);
router.post('/courses', createAdminCourse);
router.put('/courses/:courseId', updateAdminCourse);
router.delete('/courses/:courseId', deleteAdminCourse);

router.get('/courses/:courseId/lessons', getAdminCourseLessons);
router.post('/courses/:courseId/lessons', createAdminLesson);
router.put('/lessons/:lessonId', updateAdminLesson);
router.delete('/lessons/:lessonId', deleteAdminLesson);

router.get('/courses/:courseId/assignments', getAdminCourseAssignments);
router.post('/courses/:courseId/assignments', createAdminAssignment);
router.put('/assignments/:assignmentId', updateAdminAssignment);
router.delete('/assignments/:assignmentId', deleteAdminAssignment);

router.get('/courses/:courseId/quizzes', getAdminCourseQuizzes);
router.post('/courses/:courseId/quizzes', createAdminQuiz);
router.put('/quizzes/:quizId', updateAdminQuiz);
router.delete('/quizzes/:quizId', deleteAdminQuiz);

router.get('/quizzes/:quizId/questions', getAdminQuizQuestions);
router.post('/quizzes/:quizId/questions', createAdminQuizQuestion);
router.put('/questions/:questionId', updateAdminQuizQuestion);
router.delete('/questions/:questionId', deleteAdminQuizQuestion);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

export default router;
