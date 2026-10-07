import { Router } from 'express';
import { createInstructorCourse, deleteInstructorCourse, getInstructorCourses, updateInstructorCourse } from '../controllers/instructorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken, authorizeRoles('INSTRUCTOR'));
router.get('/courses', getInstructorCourses);
router.post('/courses', createInstructorCourse);
router.put('/courses/:courseId', updateInstructorCourse);
router.delete('/courses/:courseId', deleteInstructorCourse);

export default router;
