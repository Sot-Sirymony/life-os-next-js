'use client';

import ResponsiveLayout from '../../components/ResponsiveLayout';
import WeeklyPlanner from '../../components/Planner/WeeklyPlanner';
import { useState, useEffect } from 'react';

export default function PlannerPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <ResponsiveLayout 
      title="Weekly Planner" 
      description="Plan your week with time-block scheduling and task management."
    >
      {isLoading ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: 'clamp(16px, 4vw, 24px)',
          textAlign: 'center',
          color: '#666',
          boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
        }}>
          <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: '#6495ED', marginBottom: '8px' }}>Loading planner...</div>
          <div style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#666' }}>Please wait while we fetch your tasks</div>
        </div>
      ) : (
        <WeeklyPlanner tasks={tasks} onTasksChange={setTasks} />
      )}
    </ResponsiveLayout>
  );
} 