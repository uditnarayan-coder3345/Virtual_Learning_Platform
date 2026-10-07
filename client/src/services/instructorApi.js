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
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || 'Request failed');
  return payload?.data ?? payload;
}

export function getInstructorCourses() { return request('/api/instructor/courses'); }
export function createInstructorCourse(payload) {
  return request('/api/instructor/courses', { method: 'POST', body: JSON.stringify(payload) });
}
export function updateInstructorCourse(courseId, payload) {
  return request(`/api/instructor/courses/${courseId}`, { method: 'PUT', body: JSON.stringify(payload) });
}
export function deleteInstructorCourse(courseId) {
  return request(`/api/instructor/courses/${courseId}`, { method: 'DELETE' });
}
