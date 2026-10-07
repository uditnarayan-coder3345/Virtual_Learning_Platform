import { Construction } from 'lucide-react';

function ComingSoon({ title }) {
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Construction size={25} aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-slate-500">Coming Soon</p>
    </section>
  );
}

export default ComingSoon;