import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Loader from '../components/common/Loader';
import MainLayout from '../components/layout/MainLayout';
import RequireRole from '../components/auth/RequireRole';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminCourses from '../pages/admin/AdminCourses';
import AdminCourseDetails from '../pages/admin/AdminCourseDetails';
import AdminProfile from '../pages/admin/AdminProfile';
import AdminRequests from '../pages/admin/AdminRequests';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import InstructorCourses from '../pages/instructor/InstructorCourses';
import InstructorCourseDetails from '../pages/instructor/InstructorCourseDetails';
import InstructorAssignments from '../pages/instructor/InstructorAssignments';
import InstructorQuizzes from '../pages/instructor/InstructorQuizzes';
import InstructorStudents from '../pages/instructor/InstructorStudents';
import InstructorProfile from '../pages/instructor/InstructorProfile';
import StudentDashboard from '../pages/student/StudentDashboard';
import BrowseCourses from '../pages/student/BrowseCourses';
import CourseDetails from '../pages/student/CourseDetails';
import CourseLearning from '../pages/student/CourseLearning';
import MyCourses from '../pages/student/MyCourses';
import Assignments from '../pages/student/Assignments';
import AssignmentDetails from '../pages/student/AssignmentDetails';
import Quizzes from '../pages/student/Quizzes';
import TakeQuiz from '../pages/student/TakeQuiz';
import Results from '../pages/student/Results';
import Profile from '../pages/student/Profile';
import StudentReports from '../pages/student/StudentReports';

const dashboardForRole = {
  STUDENT: '/student/dashboard',
  INSTRUCTOR: '/instructor/dashboard',
  ADMIN: '/admin/dashboard',
};

function SessionRedirect() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <main className="flex min-h-screen items-center justify-center"><Loader label="Restoring your session" /></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    return <Navigate to={dashboardForRole[user.role] || '/login'} replace />;
  }
  return <Navigate to={dashboardForRole[user.role] || '/login'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SessionRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/student" element={<RequireRole role="STUDENT"><MainLayout /></RequireRole>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="browse-courses" element={<BrowseCourses />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/:id/learn" element={<CourseLearning />} />
        <Route path="courses/:id" element={<CourseDetails />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/:id" element={<AssignmentDetails />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:id" element={<TakeQuiz />} />
        <Route path="results" element={<Results />} />
        <Route path="reports" element={<StudentReports />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="/instructor" element={<RequireRole role="INSTRUCTOR"><MainLayout /></RequireRole>}>
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="courses" element={<InstructorCourses />} />
        <Route path="courses/:id" element={<InstructorCourseDetails />} />
        <Route path="assignments" element={<InstructorAssignments />} />
        <Route path="quizzes" element={<InstructorQuizzes />} />
        <Route path="students" element={<InstructorStudents />} />
        <Route path="profile" element={<InstructorProfile />} />
      </Route>
      <Route path="/admin" element={<RequireRole role="ADMIN"><MainLayout /></RequireRole>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:id" element={<AdminCourseDetails />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="requests" element={<AdminRequests />} />
      </Route>
      <Route path="*" element={<SessionRedirect />} />
    </Routes>
  );
}

export default AppRoutes;
