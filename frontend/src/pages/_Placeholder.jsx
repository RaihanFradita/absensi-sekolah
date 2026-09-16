import { Construction } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

// Placeholder sementara — halaman ini akan dilengkapi pada tahap pengerjaan berikutnya.
export default function Placeholder({ title }) {
  return (
    <PageContainer title={title}>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
        <Construction className="mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Halaman ini akan dibangun pada tahap berikutnya.
        </p>
      </div>
    </PageContainer>
  );
}
