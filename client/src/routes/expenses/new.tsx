import { createFileRoute } from '@tanstack/react-router';
import NewExpenses from '@/features/expenses/components/NewExpenses';

export const Route = createFileRoute('/expenses/new')({
  component: () => <NewExpenses />,
});
