import React, { useState } from 'react';
import { FaRobot, FaFilter, FaSort, FaLightbulb, FaClock } from 'react-icons/fa';

export default function AITaskFilter({ tasks = [] }) {
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'time', 'status'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'not-started', 'in-progress', 'done'

  const getPriorityValue = (priority) => {
    switch (priority) {
      case 'High':
        return 3;
      case 'Medium':
        return 2;
      case 'Low':
        return 1;
      default:
        return 0;
    }
  };

  const filteredTasks = tasks
    .filter(task => task.aiIntegration)
    .filter(task => {
      if (filterStatus === 'all') return true;
      return task.status.toLowerCase() === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return getPriorityValue(b.priority) - getPriorityValue(a.priority);
        case 'time':
          return parseInt(b.timeEstimate) - parseInt(a.timeEstimate);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return '#6495ED';
      case 'In Progress':
        return '#D8BFD8';
      case 'Not Started':
        return '#f8f9fa';
      default:
        return '#666';
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
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <FaRobot style={{ color: '#6495ED', fontSize: '24px' }} />
        <h3 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '20px',
          color: '#333',
          margin: 0
        }}>
          AI-Optimized Tasks
        </h3>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8f9fa',
          padding: '8px 12px',
          borderRadius: '6px'
        }}>
          <FaFilter style={{ color: '#666' }} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#333',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8f9fa',
          padding: '8px 12px',
          borderRadius: '6px'
        }}>
          <FaSort style={{ color: '#666' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#333',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="priority">Sort by Priority</option>
            <option value="time">Sort by Time</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {filteredTasks.map(task => (
          <div
            key={task.id}
            style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #eee'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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
                gap: '8px'
              }}>
                <span style={{
                  background: getPriorityColor(task.priority),
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {task.priority}
                </span>
                <span style={{
                  background: getStatusColor(task.status),
                  color: task.status === 'Done' ? '#fff' : '#333',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {task.status}
                </span>
              </div>
            </div>

            <div style={{
              color: '#666',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              {task.description}
            </div>

            {(() => {
              let suggestions = task.optimizationSuggestions;
              if (typeof suggestions === 'string') {
                try {
                  suggestions = JSON.parse(suggestions);
                } catch {
                  suggestions = [];
                }
              }
              if (!Array.isArray(suggestions)) suggestions = [];
              return suggestions.length > 0 && (
                <div style={{
                  background: '#E6F0FF',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: '#6495ED',
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    <FaLightbulb /> AI Suggestions
                  </div>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '12px',
              fontSize: '13px',
              color: '#666'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <FaClock /> {task.timeEstimate} minutes
              </div>
              {task.toolsRequired && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaTools /> {task.toolsRequired}
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            color: '#666',
            fontSize: '14px'
          }}>
            No AI-optimized tasks found. Enable AI integration for tasks to see them here.
          </div>
        )}
      </div>
    </div>
  );
} 