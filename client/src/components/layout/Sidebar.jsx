import {
  BookOpen,
  BookOpenCheck,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  UsersRound,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings2,
  UserRound,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigationByRole = {
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', to: '/student/courses', icon: BookOpen },
    { label: 'Browse Courses', to: '/student/browse-courses', icon: BookOpenCheck },
    { label: 'Assignments', to: '/student/assignments', icon: FileText },
    { label: 'Quizzes', to: '/student/quizzes', icon: ClipboardCheck },
    { label: 'Results', to: '/student/results', icon: ChartNoAxesColumnIncreasing },
    { label: 'Requests & Reports', to: '/student/reports', icon: FileText },
    { label: 'My Profile', to: '/student/profile', icon: UserRound },
  ],
  instructor: [
    { label: 'Dashboard', to: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', to: '/instructor/courses', icon: BookOpen },
    { label: 'Assignments', to: '/instructor/assignments', icon: FileText },
    { label: 'Quizzes', to: '/instructor/quizzes', icon: ClipboardCheck },
    { label: 'Students / Progress', to: '/instructor/students', icon: UsersRound },
    { label: 'Profile', to: '/instructor/profile', icon: UserRound },
  ],
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: UserRound },
    { label: 'Courses', to: '/admin/courses', icon: BookOpen },
    { label: 'Requests & Reports', to: '/admin/requests', icon: FileText },
    { label: 'Profile', to: '/admin/profile', icon: Settings2 },
  ],
};

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase() ?? 'student';
  const navigation = navigationByRole[role] ?? navigationByRole.student;

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[68px] items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <BookOpen size={21} />
            </span>
            <div>
              <p className="font-bold tracking-tight text-slate-900">Learnwise</p>
              <p className="text-[11px] font-medium text-slate-400">VIRTUAL CAMPUS</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
          <nav aria-label="Main navigation" className="mt-3 space-y-1">
            {navigation.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Settings2 size={17} />
              <span className="text-xs font-semibold capitalize">{role} workspace</span>
            </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">{role === 'admin' ? 'Manage members, courses, and your workspace.' : role === 'instructor' ? 'Manage courses, assessments, and student progress.' : 'Your learning tools, progress, and updates in one place.'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut size={18} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
