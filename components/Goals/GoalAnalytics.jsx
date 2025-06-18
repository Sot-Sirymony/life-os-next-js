import React, { useState, useEffect } from 'react';

export default function GoalAnalytics({ goals, categories, tasks }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, week, month, quarter, year
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (goals && categories && tasks) {
      setIsLoading(false);
    }
  }, [goals, categories, tasks]);

  const calculateGoalStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Done').length;
    const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
    const notStartedGoals = goals.filter(g => g.status === 'Not Started').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate average progress
    const avgProgress = totalGoals > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
      : 0;
    
    // Calculate total time spent on goals
    const totalTimeSpent = tasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    // Calculate priority distribution
    const priorityStats = goals.reduce((acc, goal) => {
      acc[goal.priority] = (acc[goal.priority] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate timeframe distribution
    const timeframeStats = goals.reduce((acc, goal) => {
      acc[goal.timeframe] = (acc[goal.timeframe] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate category performance
    const categoryStats = categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryCompleted = categoryGoals.filter(g => g.status === 'Done').length;
      const categoryProgress = categoryGoals.length > 0 
        ? Math.round(categoryGoals.reduce((sum, g) => sum + g.progress, 0) / categoryGoals.length)
        : 0;
      
      return {
        ...category,
        totalGoals: categoryGoals.length,
        completedGoals: categoryCompleted,
        completionRate: categoryGoals.length > 0 ? Math.round((categoryCompleted / categoryGoals.length) * 100) : 0,
        avgProgress: categoryProgress
      };
    });

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      notStartedGoals,
      completionRate,
      avgProgress,
      totalTimeSpent,
      priorityStats,
      timeframeStats,
      categoryStats
    };
  };

  const calculateProgressOverTime = () => {
    const now = new Date();
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const days = selectedTimeframe === 'all' ? 365 : timeframes[selectedTimeframe];
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const goalsOnDate = goals.filter(goal => {
        const goalDate = new Date(goal.createdAt);
        return goalDate <= date;
      });
      
      const completedOnDate = goalsOnDate.filter(goal => {
        if (goal.status === 'Done' && goal.completionDate) {
          const completionDate = new Date(goal.completionDate);
          return completionDate <= date;
        }
        return false;
      });
      
      const progress = goalsOnDate.length > 0 
        ? Math.round((completedOnDate.length / goalsOnDate.length) * 100)
        : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalGoals: goalsOnDate.length,
        completedGoals: completedOnDate.length,
        progress
      });
    }
    
    return data;
  };

  const calculateCategoryAnalytics = () => {
    return categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryTasks = tasks.filter(t => {
        const taskGoal = goals.find(g => g.id === t.goalId);
        return taskGoal && taskGoal.categoryId === category.id;
      });
      
      const totalTimeSpent = categoryTasks.reduce((total, task) => {
        return total + (parseInt(task.timeSpent) || 0);
      }, 0);
      
      const avgTaskDuration = categoryTasks.length > 0 
        ? Math.round(totalTimeSpent / categoryTasks.length)
        : 0;
      
      const taskCompletionRate = categoryTasks.length > 0 
        ? Math.round((categoryTasks.filter(t => t.status === 'Done').length / categoryTasks.length) * 100)
        : 0;
      
      return {
        ...category,
        totalTasks: categoryTasks.length,
        totalTimeSpent,
        avgTaskDuration,
        taskCompletionRate
      };
    });
  };

  const stats = calculateGoalStats();
  const progressData = calculateProgressOverTime();
  const categoryAnalytics = calculateCategoryAnalytics();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'Short': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Long': return '#6495ED';
      default: return '#666';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#F44336', fontFamily: "'PT Sans', sans-serif" }}>{error}</p>
      </div>
    );
  }

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
        Goal Analytics
      </h2>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Statistics */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Overall Performance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #6495ED'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎯</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6495ED',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.totalGoals}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Goals</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #4CAF50'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>✅</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4CAF50',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.completionRate}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Completion Rate</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #FF9800'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF9800',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.avgProgress}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Progress</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #9C27B0'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏱️</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#9C27B0',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {formatTime(stats.totalTimeSpent)}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Time Spent</div>
          </div>
        </div>
      </div>

      {/* Progress Over Time */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Progress Over Time
        </h3>
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          height: '200px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '2px',
          overflowX: 'auto'
        }}>
          {progressData.map((data, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                minWidth: '20px',
                background: '#6495ED',
                height: `${data.progress}%`,
                borderRadius: '2px 2px 0 0',
                position: 'relative',
                cursor: 'pointer'
              }}
              title={`${data.date}: ${data.progress}% (${data.completedGoals}/${data.totalGoals} goals)`}
            />
          ))}
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '12px', 
          color: '#666',
          marginTop: '8px',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          <span>{progressData[0]?.date}</span>
          <span>{progressData[progressData.length - 1]?.date}</span>
        </div>
      </div>

      {/* Goal Distribution */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Goal Distribution
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Priority Distribution */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Priority Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(stats.priorityStats).map(([priority, count]) => (
                <div key={priority} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '14px',
                    color: getPriorityColor(priority),
                    fontWeight: 600,
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {priority}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {count} goals ({Math.round((count / stats.totalGoals) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeframe Distribution */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Timeframe Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(stats.timeframeStats).map(([timeframe, count]) => (
                <div key={timeframe} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '14px',
                    color: getTimeframeColor(timeframe),
                    fontWeight: 600,
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {timeframe}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {count} goals ({Math.round((count / stats.totalGoals) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Category Performance
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.categoryStats.map((category) => (
            <div
              key={category.id}
              style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${category.color}30`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  fontSize: '20px',
                  background: category.color,
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {category.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {category.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                    <span>{category.totalGoals} goals</span>
                    <span>{category.completionRate}% completion</span>
                    <span>{category.avgProgress}% avg progress</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: '#E6F0FF',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${category.avgProgress}%`,
                  height: '100%',
                  background: category.color,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>Completed: {category.completedGoals}/{category.totalGoals}</span>
                <span>Progress: {category.avgProgress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Analytics Integration */}
      <div>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Category Analytics Integration
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {categoryAnalytics.map((category) => (
            <div
              key={category.id}
              style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${category.color}30`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  fontSize: '20px',
                  background: category.color,
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {category.icon}
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: '16px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  {category.name}
                </h4>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6495ED' }}>
                    {category.totalTasks}
                  </div>
                  <div style={{ color: '#666' }}>Total Tasks</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {category.taskCompletionRate}%
                  </div>
                  <div style={{ color: '#666' }}>Task Completion</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9800' }}>
                    {formatTime(category.totalTimeSpent)}
                  </div>
                  <div style={{ color: '#666' }}>Time Spent</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9C27B0' }}>
                    {formatTime(category.avgTaskDuration)}
                  </div>
                  <div style={{ color: '#666' }}>Avg Task Duration</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 