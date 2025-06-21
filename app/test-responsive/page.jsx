'use client';

import ResponsiveLayout from '../../components/ResponsiveLayout';
import ResponsiveTest from '../../components/ResponsiveTest';

export default function ResponsiveTestPage() {
  return (
    <ResponsiveLayout 
      title="Responsive Design Test" 
      description="Testing responsive features and utilities across different screen sizes."
    >
      <ResponsiveTest />
    </ResponsiveLayout>
  );
} 