import React from 'react';

export default function TimeTrackingSummary({ tasks = [] }) {
  const calculateTimeMetrics = () => {
    const completedTasks = tasks.filter(t => t.status === 'Done');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const aiOptimizedTasks = tasks.filter(t => t.aiIntegration);
    
    // Calculate total time spent
    const totalTimeSpent = completedTasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    // Calculate estimated vs actual time
    const estimatedTime = completedTasks.reduce((total, task) => {
      return total + (parseInt(task.timeEstimate) || 0);
    }, 0);
    
    const timeAccuracy = estimatedTime > 0 ? Math.round((totalTimeSpent / estimatedTime) * 100) : 0;
    
    // Calculate productivity metrics
    const today = new Date().toDateString();
    const todayTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.updatedAt).toDateString();
      return taskDate === today;
    });
    
    const todayTimeSpent = todayTasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    // Calculate weekly productivity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyTasks = completedTasks.filter(task => {
      const taskDate = new Date(task.updatedAt);
      return taskDate > weekAgo;
    });
    
    const weeklyTimeSpent = weeklyTasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    // Calculate average task duration
    const avgTaskDuration = completedTasks.length > 0 
      ? Math.round(totalTimeSpent / completedTasks.length) 
      : 0;
    
    // Calculate AI time savings (estimated 20% time savings for AI-optimized tasks)
    const aiTimeSavings = aiOptimizedTasks.reduce((total, task) => {
      const timeSpent = parseInt(task.timeSpent) || 0;
      return total + (timeSpent * 0.2);
    }, 0);
    
    return {
      totalTimeSpent,
      estimatedTime,
      timeAccuracy,
      todayTimeSpent,
      weeklyTimeSpent,
      avgTaskDuration,
      aiTimeSavings,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      aiOptimizedTasks: aiOptimizedTasks.length
    };
  };

  const metrics = calculateTimeMetrics();

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) { // less than 24 hours
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  const getProductivityLevel = (weeklyHours) => {
    if (weeklyHours >= 40) return { level: 'High', color: '#4CAF50', emoji: '🚀' };
    if (weeklyHours >= 20) return { level: 'Good', color: '#6495ED', emoji: '👍' };
    if (weeklyHours >= 10) return { level: 'Moderate', color: '#FF9800', emoji: '📈' };
    return { level: 'Low', color: '#F44336', emoji: '📉' };
  };

  const weeklyHours = Math.round(metrics.weeklyTimeSpent / 60);
  const productivityLevel = getProductivityLevel(weeklyHours);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: 'clamp(18px, 4vw, 24px)', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        Time Tracking Summary
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'clamp(16px, 3vw, 20px)' 
      }}>
        {/* Total Time Spent */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center',
          border: '2px solid #6495ED'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>⏱️</div>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            color: '#6495ED',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {formatTime(metrics.totalTimeSpent)}
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Total Time Spent
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            {metrics.completedTasks} tasks completed
          </div>
        </div>

        {/* Today's Progress */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>📅</div>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            color: '#4CAF50',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {formatTime(metrics.todayTimeSpent)}
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Today's Progress
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            Time spent today
          </div>
        </div>

        {/* Weekly Progress */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>📊</div>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            color: '#FF9800',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {formatTime(metrics.weeklyTimeSpent)}
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Weekly Progress
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            Last 7 days
          </div>
        </div>

        {/* Time Accuracy */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>🎯</div>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 'bold',
            color: '#9C27B0',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {metrics.timeAccuracy}%
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Time Accuracy
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            Estimated vs actual
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'clamp(16px, 3vw, 20px)',
        marginTop: 'clamp(16px, 3vw, 20px)'
      }}>
        {/* AI Time Savings */}
        <div style={{
          background: '#E8F5E8',
          borderRadius: '8px',
          padding: 'clamp(12px, 3vw, 16px)',
          border: '2px solid #4CAF50'
        }}>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#4CAF50',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            🤖 AI Time Savings
          </div>
          <div style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            {formatTime(metrics.aiTimeSavings)}
          </div>
          <div style={{
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            Time saved with AI
          </div>
        </div>
        
        <div style={{
          background: '#E3F2FD',
          borderRadius: '8px',
          padding: 'clamp(12px, 3vw, 16px)',
          border: '2px solid #6495ED'
        }}>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#6495ED',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            📊 Average Task Duration
          </div>
          <div style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            {formatTime(metrics.avgTaskDuration)}
          </div>
          <div style={{
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            Per completed task
          </div>
        </div>
        
        <div style={{
          background: '#FFF3E0',
          borderRadius: '8px',
          padding: 'clamp(12px, 3vw, 16px)',
          border: '2px solid #FF9800'
        }}>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#FF9800',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            🔄 In Progress
          </div>
          <div style={{
            fontSize: 'clamp(16px, 3vw, 20px)',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            {metrics.inProgressTasks}
          </div>
          <div style={{
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            Active tasks
          </div>
        </div>
      </div>
    </div>
  );
} 