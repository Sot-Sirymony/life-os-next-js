'use client';

import ResponsiveLayout from '../../components/ResponsiveLayout';
import GoalCategories from '../../components/Goals/GoalCategories';

export default function CategoriesPage() {
  return (
    <ResponsiveLayout 
      title="Goal Categories" 
      description="Organize and manage your goals by categories for better structure and focus."
    >
      <GoalCategories />
    </ResponsiveLayout>
  );
} 