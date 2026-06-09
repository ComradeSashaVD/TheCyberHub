import { GamificationAdmin } from '@/components/admin/GamificationAdmin';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gamification Admin',
};

export default function AdminGamificationPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gamification Management</h1>
      <GamificationAdmin />
    </div>
  );
}