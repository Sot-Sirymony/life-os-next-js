import React from 'react';

export default function PerformanceInsights({ goals = [], tasks = [] }) {
  const calculateInsights = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Done').length;
    const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const aiOptimizedTasks = tasks.filter(t => t.aiIntegration).length;
    
    // Calculate completion rates
    const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Calculate productivity score (weighted average)
    const productivityScore = Math.round(
      (goalCompletionRate * 0.6) + (taskCompletionRate * 0.4)
    );
    
    // Calculate category distribution
    const categoryStats = goals.reduce((acc, goal) => {
      const categoryName = goal.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = { total: 0, completed: 0 };
      }
      acc[categoryName].total++;
      if (goal.status === 'Done') {
        acc[categoryName].completed++;
      }
      return acc;
    }, {});
    
    // Find best and worst performing categories
    const categoryPerformance = Object.entries(categoryStats).map(([name, stats]) => ({
      name,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      total: stats.total
    })).sort((a, b) => b.completionRate - a.completionRate);
    
    const bestCategory = categoryPerformance[0];
    const worstCategory = categoryPerformance[categoryPerformance.length - 1];
    
    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      goalCompletionRate: Math.round(goalCompletionRate),
      totalTasks,
      completedTasks,
      taskCompletionRate: Math.round(taskCompletionRate),
      aiOptimizedTasks,
      productivityScore,
      bestCategory,
      worstCategory
    };
  };

  const insights = calculateInsights();

  const getProductivityLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: '#4CAF50', emoji: '🚀' };
    if (score >= 60) return { level: 'Good', color: '#6495ED', emoji: '👍' };
    if (score >= 40) return { level: 'Fair', color: '#FF9800', emoji: '📈' };
    return { level: 'Needs Improvement', color: '#F44336', emoji: '📉' };
  };

  const productivityLevel = getProductivityLevel(insights.productivityScore);

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
        Performance Insights
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 'clamp(16px, 3vw, 20px)' 
      }}>
        {/* Goal Completion Rate */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center',
          border: '2px solid #6495ED'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>🎯</div>
          <div style={{
            fontSize: 'clamp(24px, 6vw, 36px)',
            fontWeight: 'bold',
            color: '#6495ED',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {insights.goalCompletionRate}%
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Goal Completion
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            {insights.totalGoals} total goals
          </div>
        </div>

        {/* Task Completion Rate */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>📋</div>
          <div style={{
            fontSize: 'clamp(24px, 6vw, 36px)',
            fontWeight: 'bold',
            color: '#4CAF50',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {insights.taskCompletionRate}%
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Task Completion
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            {insights.totalTasks} total tasks
          </div>
        </div>

        {/* AI Optimization */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>🤖</div>
          <div style={{
            fontSize: 'clamp(24px, 6vw, 36px)',
            fontWeight: 'bold',
            color: '#9C27B0',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {insights.aiOptimizedTasks}
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            AI-Optimized Tasks
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            Enhanced productivity
          </div>
        </div>

        {/* Productivity Score */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: 'clamp(16px, 3vw, 20px)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: '8px' }}>📊</div>
          <div style={{
            fontSize: 'clamp(24px, 6vw, 36px)',
            fontWeight: 'bold',
            color: '#FF9800',
            fontFamily: "'Poppins', sans-serif",
            marginBottom: '4px'
          }}>
            {insights.productivityScore}%
          </div>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 16px)',
            color: '#333',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: 600
          }}>
            Productivity Score
          </div>
          <div style={{
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            marginTop: '4px'
          }}>
            Overall performance
          </div>
        </div>
      </div>

      {/* Category Performance */}
      {insights.bestCategory && insights.worstCategory && (
        <div style={{ marginTop: 'clamp(16px, 4vw, 24px)' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: 'clamp(16px, 3vw, 18px)',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Category Performance
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'clamp(12px, 3vw, 16px)' 
          }}>
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
                🏆 Best Performing
              </div>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 16px)',
                color: '#333',
                fontFamily: "'PT Sans', sans-serif",
                fontWeight: 600
              }}>
                {insights.bestCategory.name}
              </div>
              <div style={{
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                color: '#666',
                fontFamily: "'PT Sans', sans-serif"
              }}>
                {Math.round(insights.bestCategory.completionRate)}% completion ({insights.bestCategory.total} goals)
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
                📈 Needs Improvement
              </div>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 16px)',
                color: '#333',
                fontFamily: "'PT Sans', sans-serif",
                fontWeight: 600
              }}>
                {insights.worstCategory.name}
              </div>
              <div style={{
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                color: '#666',
                fontFamily: "'PT Sans', sans-serif"
              }}>
                {Math.round(insights.worstCategory.completionRate)}% completion ({insights.worstCategory.total} goals)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 