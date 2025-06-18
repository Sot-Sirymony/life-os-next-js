import React from 'react';

export default function SummaryCards({ goals, tasks }) {
  // Calculate overall completion rate
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.status === 'Done').length;
  const completionRate = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Calculate category-wise progress
  const categoryProgress = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = { total: 0, completed: 0 };
    }
    acc[goal.category].total++;
    if (goal.status === 'Done') {
      acc[goal.category].completed++;
    }
    return acc;
  }, {});

  // Calculate time spent on tasks
  const totalTimeSpent = tasks.reduce((acc, task) => {
    if (task.status === 'Done' && task.timeEstimate) {
      const minutes = parseInt(task.timeEstimate);
      return acc + (isNaN(minutes) ? 0 : minutes);
    }
    return acc;
  }, 0);

  // Calculate upcoming deadlines (tasks not completed)
  const upcomingTasks = tasks.filter(task => task.status !== 'Done').length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Overall Progress Card */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#E6F0FF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            📊
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              color: '#333',
              margin: 0
            }}>
              Overall Progress
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              {totalGoals} total goals
            </div>
          </div>
        </div>
        <div style={{
          background: '#E6F0FF',
          borderRadius: '8px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#6495ED',
            height: '100%',
            width: `${completionRate}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <div style={{
          fontSize: '24px',
          fontFamily: "'Poppins', sans-serif",
          color: '#6495ED',
          fontWeight: 600
        }}>
          {completionRate}%
        </div>
      </div>

      {/* Category Progress Card */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#E6F0FF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🎯
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              color: '#333',
              margin: 0
            }}>
              Category Progress
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              {Object.keys(categoryProgress).length} categories
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          {Object.entries(categoryProgress).map(([category, { total, completed }]) => {
            const rate = Math.round((completed / total) * 100);
            return (
              <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <span>{category}</span>
                  <span>{rate}%</span>
                </div>
                <div style={{
                  background: '#E6F0FF',
                  borderRadius: '4px',
                  height: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#6495ED',
                    height: '100%',
                    width: `${rate}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Spent Card */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#E6F0FF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            ⏱️
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              color: '#333',
              margin: 0
            }}>
              Time Spent
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              On completed tasks
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '24px',
          fontFamily: "'Poppins', sans-serif",
          color: '#6495ED',
          fontWeight: 600
        }}>
          {Math.round(totalTimeSpent / 60)} hours
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666'
        }}>
          {totalTimeSpent % 60} minutes
        </div>
      </div>

      {/* Upcoming Tasks Card */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#E6F0FF',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            📅
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              color: '#333',
              margin: 0
            }}>
              Upcoming Tasks
            </h3>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              Pending completion
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '24px',
          fontFamily: "'Poppins', sans-serif",
          color: '#6495ED',
          fontWeight: 600
        }}>
          {upcomingTasks}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666'
        }}>
          tasks remaining
        </div>
      </div>
    </div>
  );
} 