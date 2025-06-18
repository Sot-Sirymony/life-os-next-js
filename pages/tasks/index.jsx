import Sidebar from '../../components/Sidebar';
import AITaskFilter from '../../components/Progress/AITaskFilter';
import { useState, useEffect } from 'react';

export default function TasksPage() {
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
            Task Management
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            View and manage all your tasks with AI optimization.
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
            Loading tasks...
          </div>
        ) : (
          <AITaskFilter tasks={tasks} />
        )}
      </main>
    </div>
  );
} 