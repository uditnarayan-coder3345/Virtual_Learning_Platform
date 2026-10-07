import { LoaderCircle } from 'lucide-react';

function Loader({ label = 'Loading', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${className}`}>
      <LoaderCircle size={18} className="animate-spin text-blue-600" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;