const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getAuthToken() {
  return localStorage.getItem('vlp-auth-token') ?? sessionStorage.getItem('vlp-auth-token') ?? null;
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload?.data ?? payload;
}

export function getAdminDashboard() {
  return request('/api/admin/dashboard');
}

export function getAdminUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/admin/users${suffix}`);
}

export function getPendingAdminUsers() {
  return request('/api/admin/users/pending');
}

export function updateAdminUserStatus(userId, action) {
  return request(`/api/admin/users/${userId}/${action}`, { method: 'PATCH' });
}

export function getAdminReports(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/admin/reports${suffix}`);
}

export function updateAdminReport(reportId, payload) {
  return request(`/api/admin/reports/${reportId}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function getAdminUser(userId) {
  return request(`/api/admin/users/${userId}`);
}

export function deleteAdminUser(userId) {
  return request(`/api/admin/users/${userId}`, { method: 'DELETE' });
}

export function getAdminCourses(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/admin/courses${suffix}`);
}

export function getAdminCourse(courseId) {
  return request(`/api/admin/courses/${courseId}`);
}

export function createAdminCourse(payload) {
  return request('/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminCourse(courseId, payload) {
  return request(`/api/admin/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminCourse(courseId) {
  return request(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
}

export function getAdminCourseLessons(courseId) {
  return request(`/api/admin/courses/${courseId}/lessons`);
}

export function createAdminLesson(courseId, payload) {
  return request(`/api/admin/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminLesson(lessonId, payload) {
  return request(`/api/admin/lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminLesson(lessonId) {
  return request(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });
}

export function getAdminCourseAssignments(courseId) {
  return request(`/api/admin/courses/${courseId}/assignments`);
}

export function createAdminAssignment(courseId, payload) {
  return request(`/api/admin/courses/${courseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminAssignment(assignmentId, payload) {
  return request(`/api/admin/assignments/${assignmentId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminAssignment(assignmentId) {
  return request(`/api/admin/assignments/${assignmentId}`, { method: 'DELETE' });
}

export function getAdminCourseQuizzes(courseId) {
  return request(`/api/admin/courses/${courseId}/quizzes`);
}

export function createAdminQuiz(courseId, payload) {
  return request(`/api/admin/courses/${courseId}/quizzes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminQuiz(quizId, payload) {
  return request(`/api/admin/quizzes/${quizId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminQuiz(quizId) {
  return request(`/api/admin/quizzes/${quizId}`, { method: 'DELETE' });
}

export function getAdminQuizQuestions(quizId) {
  return request(`/api/admin/quizzes/${quizId}/questions`);
}

export function createAdminQuizQuestion(quizId, payload) {
  return request(`/api/admin/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminQuizQuestion(questionId, payload) {
  return request(`/api/admin/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminQuizQuestion(questionId) {
  return request(`/api/admin/questions/${questionId}`, { method: 'DELETE' });
}

export function getAdminProfile() {
  return request('/api/admin/profile');
}

export function updateAdminProfile(payload) {
  return request('/api/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
