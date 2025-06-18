import React from 'react';

export default function AchievementHighlights({ goals, tasks }) {
  const getAchievements = () => {
    const achievements = [];
    
    // Goal completion achievements
    const completedGoals = goals.filter(g => g.status === 'Done');
    if (completedGoals.length >= 1) {
      achievements.push({
        type: 'goal_completion',
        title: 'First Goal Completed!',
        description: `You've completed your first goal: "${completedGoals[0].title}"`,
        icon: '🎯',
        color: '#4CAF50',
        timestamp: completedGoals[0].completionDate || completedGoals[0].updatedAt
      });
    }
    
    if (completedGoals.length >= 5) {
      achievements.push({
        type: 'goal_completion',
        title: 'Goal Master',
        description: 'You\'ve completed 5 goals! Keep up the great work!',
        icon: '🏆',
        color: '#FFD700',
        timestamp: completedGoals[4].completionDate || completedGoals[4].updatedAt
      });
    }
    
    if (completedGoals.length >= 10) {
      achievements.push({
        type: 'goal_completion',
        title: 'Goal Champion',
        description: 'Incredible! You\'ve completed 10 goals!',
        icon: '👑',
        color: '#9C27B0',
        timestamp: completedGoals[9].completionDate || completedGoals[9].updatedAt
      });
    }
    
    // Task completion achievements
    const completedTasks = tasks.filter(t => t.status === 'Done');
    if (completedTasks.length >= 10) {
      achievements.push({
        type: 'task_completion',
        title: 'Task Warrior',
        description: 'You\'ve completed 10 tasks!',
        icon: '⚡',
        color: '#FF9800',
        timestamp: completedTasks[9].updatedAt
      });
    }
    
    if (completedTasks.length >= 50) {
      achievements.push({
        type: 'task_completion',
        title: 'Task Master',
        description: 'Amazing! You\'ve completed 50 tasks!',
        icon: '🚀',
        color: '#6495ED',
        timestamp: completedTasks[49].updatedAt
      });
    }
    
    // AI optimization achievements
    const aiOptimizedTasks = tasks.filter(t => t.aiIntegration);
    if (aiOptimizedTasks.length >= 5) {
      achievements.push({
        type: 'ai_optimization',
        title: 'AI Enthusiast',
        description: 'You\'ve used AI optimization for 5 tasks!',
        icon: '🤖',
        color: '#9C27B0',
        timestamp: aiOptimizedTasks[4].updatedAt
      });
    }
    
    // Category balance achievements
    const categoryCounts = goals.reduce((acc, goal) => {
      const categoryName = goal.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});
    
    const uniqueCategories = Object.keys(categoryCounts).length;
    if (uniqueCategories >= 3) {
      achievements.push({
        type: 'category_balance',
        title: 'Well-Rounded',
        description: 'You\'re working on goals across 3 different categories!',
        icon: '🌈',
        color: '#4CAF50',
        timestamp: new Date().toISOString()
      });
    }
    
    // Streak achievements (simplified - could be enhanced with real streak tracking)
    const recentCompletions = completedGoals.filter(g => {
      const completionDate = new Date(g.completionDate || g.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completionDate > weekAgo;
    });
    
    if (recentCompletions.length >= 3) {
      achievements.push({
        type: 'streak',
        title: 'On Fire!',
        description: 'You\'ve completed 3 goals in the last week!',
        icon: '🔥',
        color: '#F44336',
        timestamp: recentCompletions[recentCompletions.length - 1].completionDate || recentCompletions[recentCompletions.length - 1].updatedAt
      });
    }
    
    return achievements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const achievements = getAchievements();
  const recentAchievements = achievements.slice(0, 5);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const achievementTime = new Date(timestamp);
    const diffInDays = Math.floor((now - achievementTime) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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
        Achievement Highlights
      </h2>
      
      {recentAchievements.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
          <p style={{ margin: 0 }}>No achievements yet</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Complete goals and tasks to earn achievements!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recentAchievements.map((achievement, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${achievement.color}15, ${achievement.color}08)`,
                border: `2px solid ${achievement.color}30`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Achievement Icon */}
              <div style={{
                fontSize: '32px',
                background: achievement.color,
                color: '#fff',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {achievement.icon}
              </div>
              
              {/* Achievement Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  marginBottom: '4px'
                }}>
                  {achievement.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif",
                  marginBottom: '8px'
                }}>
                  {achievement.description}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: achievement.color,
                  fontFamily: "'PT Sans', sans-serif",
                  fontWeight: 600
                }}>
                  {formatTimeAgo(achievement.timestamp)}
                </div>
              </div>
              
              {/* Achievement Badge */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: achievement.color,
                color: '#fff',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '10px',
                fontFamily: "'PT Sans', sans-serif",
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {achievement.type.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Achievement Stats */}
      <div style={{ 
        marginTop: '24px',
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontFamily: "'PT Sans', sans-serif",
          fontSize: '14px',
          color: '#666'
        }}>
          Total Achievements: {achievements.length}
        </div>
        <div style={{
          fontFamily: "'PT Sans', sans-serif",
          fontSize: '14px',
          color: '#6495ED',
          fontWeight: 600
        }}>
          Keep going! 🚀
        </div>
      </div>
    </div>
  );
} 