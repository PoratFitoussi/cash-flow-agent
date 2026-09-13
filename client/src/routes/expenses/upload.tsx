import { createFileRoute } from '@tanstack/react-router';
import UploadExpenses from '@/features/expenses/components/UploadExpenses';

export const Route = createFileRoute('/expenses/upload')({
  component: () => <UploadExpenses />,
});
