import { useId } from 'react';
import { X } from 'lucide-react';

function Dialog({ title, eyebrow = 'Details', onClose, children, className = 'max-w-2xl' }) {
  const titleId = useId();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6 ${className}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{eyebrow}</p><h2 id={titleId} className="mt-1 text-xl font-bold text-slate-900">{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default Dialog;
