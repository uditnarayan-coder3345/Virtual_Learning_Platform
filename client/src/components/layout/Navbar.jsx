import { Bell, GraduationCap, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() ?? 'ST';

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
        </button>
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap size={20} />
          </span>
          <span className="font-bold text-slate-900">VLP</span>
        </div>
        <label className="hidden h-10 w-[min(34vw,360px)] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400 md:flex">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search your learning space"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            aria-label="Search your learning space"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
        </button>
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3 sm:pl-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {initials}
          </span>
          <div className="hidden sm:block">
            <p className="max-w-36 truncate text-sm font-semibold text-slate-800">{user?.name ?? 'Student'}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role?.toLowerCase() ?? 'student'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
