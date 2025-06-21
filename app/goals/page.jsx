'use client';

import LifeGoalsBoard from '@/components/Goals/LifeGoalsBoard';
import ResponsiveLayout from '@/components/ResponsiveLayout';

export default function GoalsPage() {
  return (
    <ResponsiveLayout 
      title="Goals" 
      description="Set, track, and achieve your life goals with our comprehensive goal management system."
    >
      <LifeGoalsBoard />
    </ResponsiveLayout>
  );
} 