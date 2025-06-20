'use client';

import Sidebar from '../../components/Sidebar';
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
    <div style={{ 
      display: 'flex',
      background: '#E6F0FF',
      minHeight: '100vh',
      fontFamily: "'PT Sans', sans-serif"
    }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            margin: '0 0 8px 0',
            fontSize: '32px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Progress Tracking
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            Monitor your progress and track achievements across all your goals.
          </p>
        </div>
        
        {isLoading ? (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading progress data...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            <SummaryCards goals={goals} tasks={tasks} />
            <GoalProgressBoard goals={goals} />
            <AITaskFilter tasks={tasks} />
          </div>
        )}
      </main>
    </div>
  );
} 