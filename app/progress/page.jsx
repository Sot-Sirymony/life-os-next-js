'use client';

import ResponsiveLayout from '../../components/ResponsiveLayout';
import SummaryCards from '../../components/Progress/SummaryCards';
import GoalProgressBoard from '../../components/Progress/GoalProgressBoard';
import AITaskFilter from '../../components/Progress/AITaskFilter';
import { useState, useEffect } from 'react';

export default function ProgressPage() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsResponse, tasksResponse] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/tasks')
        ]);
        
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);
        }
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ResponsiveLayout 
      title="Progress Tracking" 
      description="Monitor your progress and track achievements across all your goals."
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
          <div style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: '#6495ED', marginBottom: '8px' }}>Loading progress data...</div>
          <div style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#666' }}>Please wait while we fetch your data</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'clamp(16px, 4vw, 24px)' }}>
          <SummaryCards goals={goals} tasks={tasks} />
          <GoalProgressBoard goals={goals} />
          <AITaskFilter tasks={tasks} />
        </div>
      )}
    </ResponsiveLayout>
  );
} 