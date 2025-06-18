import React from 'react';

export default function RecentActivityFeed({ activities = [] }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'goal_created': return '🎯';
      case 'goal_completed': return '✅';
      case 'goal_updated': return '📝';
      case 'task_created': return '📋';
      case 'task_completed': return '☑️';
      case 'task_updated': return '✏️';
      case 'milestone_reached': return '🏆';
      default: return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'goal_completed':
      case 'task_completed':
      case 'milestone_reached': return '#4CAF50';
      case 'goal_created':
      case 'task_created': return '#6495ED';
      case 'goal_updated':
      case 'task_updated': return '#FF9800';
      default: return '#666';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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
        Recent Activity
      </h2>
      
      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <p style={{ margin: 0 }}>No recent activity</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Start creating goals and tasks to see your activity here
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.slice(0, 10).map((activity, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8f9fa',
                borderLeft: `4px solid ${getActivityColor(activity.type)}`
              }}
            >
              <span style={{ fontSize: '20px' }}>
                {getActivityIcon(activity.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'PT Sans', sans-serif",
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: 500
                }}>
                  {activity.description}
                </div>
                <div style={{
                  fontFamily: "'PT Sans', sans-serif",
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '2px'
                }}>
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 