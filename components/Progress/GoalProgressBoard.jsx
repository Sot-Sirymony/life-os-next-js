import React from 'react';

export default function GoalProgressBoard({ goals }) {
  // Group goals by category
  const goalsByCategory = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {});

  // Calculate progress for each category
  const categoryProgress = Object.entries(goalsByCategory).map(([category, goals]) => {
    const total = goals.length;
    const completed = goals.filter(goal => goal.status === 'Done').length;
    const inProgress = goals.filter(goal => goal.status === 'In Progress').length;
    const notStarted = goals.filter(goal => goal.status === 'Not Started').length;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    return {
      category,
      total,
      completed,
      inProgress,
      notStarted,
      progress
    };
  });

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
    }}>
      <h2 style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: '20px',
        color: '#333',
        marginBottom: '24px'
      }}>
        Goal Progress Board
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {categoryProgress.map(({ category, total, completed, inProgress, notStarted, progress }) => (
          <div key={category} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '16px',
                  color: '#333',
                  margin: 0
                }}>
                  {category}
                </h3>
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {total} goals
                </div>
              </div>
              <div style={{
                fontSize: '20px',
                fontFamily: "'Poppins', sans-serif",
                color: '#6495ED',
                fontWeight: 600
              }}>
                {progress}%
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              background: '#E6F0FF',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#6495ED',
                height: '100%',
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Status Breakdown */}
            <div style={{
              display: 'flex',
              gap: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#6495ED',
                  borderRadius: '50%'
                }} />
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {completed} Completed
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#D8BFD8',
                  borderRadius: '50%'
                }} />
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {inProgress} In Progress
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#E6F0FF',
                  borderRadius: '50%'
                }} />
                <div style={{
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {notStarted} Not Started
                </div>
              </div>
            </div>

            {/* Goal List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '8px'
            }}>
              {goalsByCategory[category].map(goal => (
                <div key={goal.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <div style={{ color: '#333' }}>{goal.title}</div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: goal.status === 'Done' ? '#E6F0FF' : 
                              goal.status === 'In Progress' ? '#F0E6FF' : '#f8f9fa',
                    color: goal.status === 'Done' ? '#6495ED' : 
                          goal.status === 'In Progress' ? '#D8BFD8' : '#666',
                    fontSize: '12px'
                  }}>
                    {goal.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 