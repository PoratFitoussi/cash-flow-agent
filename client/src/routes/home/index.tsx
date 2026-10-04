import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/home/')({
  beforeLoad: () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    throw redirect({
      to: '/home/$period',
      params: { period: `${year}-${month}` }
    });
  },
  component: () => null,
});
