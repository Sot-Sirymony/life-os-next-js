import React from 'react';

export default function TimeTrackingSummary({ tasks }) {
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
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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
      padding: '24px',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '24px', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        Time Tracking Summary
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {/* Total Time Spent */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          border: '2px solid #6495ED'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱️</div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#6495ED',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {formatTime(metrics.totalTimeSpent)}
          </div>
          <div style={{
            fontSize: '16px',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Total Time Spent
          </div>
          <div style={{
            fontSize: '14px',
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
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#4CAF50',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {formatTime(metrics.todayTimeSpent)}
          </div>
          <div style={{
            fontSize: '16px',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Today's Progress
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            {Math.round(metrics.todayTimeSpent / 60)} hours today
          </div>
        </div>

        {/* Weekly Productivity */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center',
          border: `2px solid ${productivityLevel.color}`
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
            {productivityLevel.emoji}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: productivityLevel.color,
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {weeklyHours}h
          </div>
          <div style={{
            fontSize: '16px',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            {productivityLevel.level} Productivity
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            This week
          </div>
        </div>

        {/* AI Time Savings */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#9C27B0',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {formatTime(Math.round(metrics.aiTimeSavings))}
          </div>
          <div style={{
            fontSize: '16px',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            AI Time Savings
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            {metrics.aiOptimizedTasks} AI tasks
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Detailed Metrics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{
            background: '#E8F5E8',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #4CAF50'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#4CAF50',
              fontFamily: "'PT Sans', sans-serif",
              fontWeight: 600,
              marginBottom: '4px'
            }}>
              ⏱️ Time Accuracy
            </div>
            <div style={{
              fontSize: '20px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {metrics.timeAccuracy}%
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontFamily: "'PT Sans', sans-serif"
            }}>
              Estimated vs Actual
            </div>
          </div>
          
          <div style={{
            background: '#E3F2FD',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #6495ED'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6495ED',
              fontFamily: "'PT Sans', sans-serif",
              fontWeight: 600,
              marginBottom: '4px'
            }}>
              📊 Average Task Duration
            </div>
            <div style={{
              fontSize: '20px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {formatTime(metrics.avgTaskDuration)}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontFamily: "'PT Sans', sans-serif"
            }}>
              Per completed task
            </div>
          </div>
          
          <div style={{
            background: '#FFF3E0',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #FF9800'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#FF9800',
              fontFamily: "'PT Sans', sans-serif",
              fontWeight: 600,
              marginBottom: '4px'
            }}>
              🔄 In Progress
            </div>
            <div style={{
              fontSize: '20px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {metrics.inProgressTasks}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              fontFamily: "'PT Sans', sans-serif"
            }}>
              Active tasks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 