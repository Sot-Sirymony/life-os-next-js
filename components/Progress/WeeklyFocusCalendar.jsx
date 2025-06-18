import React, { useState } from 'react';
import { FaCalendarAlt, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeeklyFocusCalendar({ tasks = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

  const getTasksForTimeSlot = (day, hour) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduledTime);
      return taskDate.getDay() === DAYS.indexOf(day) && taskDate.getHours() === hour;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#ff6b6b';
      case 'Medium':
        return '#ffd93d';
      case 'Low':
        return '#6bff6b';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <FaCheck style={{ color: '#6495ED' }} />;
      case 'In Progress':
        return <FaClock style={{ color: '#D8BFD8' }} />;
      case 'Overdue':
        return <FaExclamationTriangle style={{ color: '#ff6b6b' }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <FaCalendarAlt style={{ color: '#6495ED', fontSize: '24px' }} />
          <h3 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '20px',
            color: '#333',
            margin: 0
          }}>
            Weekly Focus Calendar
          </h3>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={() => setViewMode('week')}
            style={{
              background: viewMode === 'week' ? '#6495ED' : '#f8f9fa',
              color: viewMode === 'week' ? '#fff' : '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode('day')}
            style={{
              background: viewMode === 'day' ? '#6495ED' : '#f8f9fa',
              color: viewMode === 'day' ? '#fff' : '#333',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Day View
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(7, 1fr)',
          gap: '1px',
          background: '#eee'
        }}>
          {/* Time column */}
          <div style={{ background: '#f8f9fa', padding: '8px' }}></div>
          {DAYS.map(day => (
            <div
              key={day}
              style={{
                background: '#f8f9fa',
                padding: '8px',
                textAlign: 'center',
                fontWeight: 500,
                color: '#333'
              }}
            >
              {day}
            </div>
          ))}

          {/* Time slots */}
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              <div style={{
                background: '#f8f9fa',
                padding: '8px',
                textAlign: 'right',
                color: '#666',
                fontSize: '14px'
              }}>
                {hour}:00
              </div>
              {DAYS.map(day => {
                const tasksInSlot = getTasksForTimeSlot(day, hour);
                return (
                  <div
                    key={`${day}-${hour}`}
                    style={{
                      background: 'white',
                      padding: '8px',
                      minHeight: '60px',
                      border: '1px solid #eee'
                    }}
                  >
                    {tasksInSlot.map(task => (
                      <div
                        key={task.id}
                        style={{
                          background: getPriorityColor(task.priority),
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          marginBottom: '4px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {getStatusIcon(task.status)}
                        {task.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {HOURS.map(hour => {
            const tasksInHour = tasks.filter(task => {
              const taskDate = new Date(task.scheduledTime);
              return taskDate.getHours() === hour;
            });

            return (
              <div
                key={hour}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  minWidth: '60px',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {hour}:00
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  flex: 1
                }}>
                  {tasksInHour.map(task => (
                    <div
                      key={task.id}
                      style={{
                        background: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #eee'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          {task.title}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {getStatusIcon(task.status)}
                          <span style={{
                            background: getPriorityColor(task.priority),
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        {task.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 