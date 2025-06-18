import React, { useState, useEffect } from 'react';

export default function CategoryDetailView({ category, onClose, onEdit, onDelete }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      fetchCategoryGoals();
    }
  }, [category]);

  const fetchCategoryGoals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/goals');
      if (response.ok) {
        const allGoals = await response.json();
        const categoryGoals = allGoals.filter(goal => goal.categoryId === category.id);
        setGoals(categoryGoals);
      } else {
        throw new Error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching category goals:', error);
      setError('Failed to load category goals');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCategoryStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Done').length;
    const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
    const notStartedGoals = goals.filter(g => g.status === 'Not Started').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate average progress
    const avgProgress = totalGoals > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
      : 0;
    
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
    
    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      notStartedGoals,
      completionRate,
      avgProgress,
      priorityStats,
      timeframeStats
    };
  };

  const stats = calculateCategoryStats();

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

  if (!category) return null;

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading category details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#F44336', fontFamily: "'PT Sans', sans-serif" }}>{error}</p>
        <button
          onClick={fetchCategoryGoals}
          style={{
            background: '#6495ED',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontFamily: "'PT Sans', sans-serif",
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
        fontFamily: "'PT Sans', sans-serif"
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            fontSize: '32px',
            background: category.color,
            color: '#fff',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {category.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {category.name}
            </h2>
            {category.description && (
              <p style={{
                margin: 0,
                color: '#666',
                fontSize: '14px'
              }}>
                {category.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(category)}
              style={{
                background: '#6495ED',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontFamily: "'PT Sans', sans-serif",
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(category)}
              style={{
                background: '#F44336',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontFamily: "'PT Sans', sans-serif",
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontFamily: "'PT Sans', sans-serif",
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Category Statistics */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Category Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
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
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔄</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#9C27B0',
                fontFamily: "'Poppins', sans-serif"
              }}>
                {stats.inProgressGoals}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>In Progress</div>
            </div>
          </div>
        </div>

        {/* Goal Distribution */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Goal Distribution
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Priority Distribution */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
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
                      fontSize: '12px',
                      color: getPriorityColor(priority),
                      fontWeight: 600
                    }}>
                      {priority}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {count} goals
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
                fontSize: '14px',
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
                      fontSize: '12px',
                      color: getTimeframeColor(timeframe),
                      fontWeight: 600
                    }}>
                      {timeframe}
                    </span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {count} goals
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Associated Goals */}
        <div>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Associated Goals ({goals.length})
          </h3>
          {goals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <p style={{ margin: 0 }}>No goals in this category yet</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                Create goals to see them here
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '16px',
                    border: `2px solid ${goal.status === 'Done' ? '#4CAF50' : goal.status === 'In Progress' ? '#FF9800' : '#E6F0FF'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      color: '#333',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600
                    }}>
                      {goal.title}
                    </h4>
                    <span style={{
                      background: goal.status === 'Done' ? '#4CAF50' : goal.status === 'In Progress' ? '#FF9800' : '#666',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      {goal.status}
                    </span>
                  </div>
                  {goal.description && (
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {goal.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                    <span>Progress: {goal.progress}%</span>
                    <span>Priority: {goal.priority}</span>
                    <span>Timeframe: {goal.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 