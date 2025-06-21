import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaList, FaCalendarWeek, FaPlus, FaEdit, FaTrash, FaLink, FaCheck, FaTimes } from 'react-icons/fa';
import useAlert from '../../hooks/useAlert';
import AlertContainer from '../common/AlertContainer';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlanner({ tasks = [], onTasksChange }) {
  const [view, setView] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [draggedTask, setDraggedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    day: selectedDay,
    startTime: '09:00',
    endTime: '10:00',
    status: 'Not Started',
    priority: 'Medium',
    goalId: '',
    timeEstimate: '',
    timeSpent: 0,
    notes: ''
  });

  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      showError('Failed to load goals');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      showError('Task title is required');
      return;
    }

    try {
      const taskData = {
        ...newTask,
        goalId: newTask.goalId || null,
        timeEstimate: newTask.timeEstimate ? parseInt(newTask.timeEstimate) : null,
        timeSpent: parseInt(newTask.timeSpent) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const createdTask = await response.json();
        onTasksChange([...tasks, createdTask]);
        setNewTask({
          title: '',
          description: '',
          day: selectedDay,
          startTime: '09:00',
          endTime: '10:00',
          status: 'Not Started',
          priority: 'Medium',
          goalId: '',
          timeEstimate: '',
          timeSpent: 0,
          notes: ''
        });
        setIsAddingTask(false);
        showSuccess('Task created successfully!');
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showError('Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, ...updatedData }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? updatedTask : task
        );
        onTasksChange(updatedTasks);
        setIsEditingTask(false);
        setEditingTask(null);
        showSuccess('Task updated successfully!');
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId }),
      });

      if (response.ok) {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        onTasksChange(updatedTasks);
        showSuccess('Task deleted successfully!');
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task. Please try again.');
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDrop = async (day, hour) => {
    if (!draggedTask) return;

    const updatedTask = {
      ...draggedTask,
      day,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      updatedAt: new Date().toISOString()
    };

    await handleUpdateTask(draggedTask.id, updatedTask);
    setDraggedTask(null);
  };

  const getTasksForTimeSlot = (day, hour) => {
    return tasks.filter(task => {
      if (!task.startTime || typeof task.startTime !== 'string') return false;
      const taskStartHour = parseInt(task.startTime.split(':')[0]);
      return task.day === day && taskStartHour === hour;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Not Started': return '#666';
      default: return '#666';
    }
  };

  const renderTimeSlot = (day, hour) => {
    const tasksInSlot = getTasksForTimeSlot(day, hour);
    return (
      <div
        key={`${day}-${hour}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(day, hour)}
        style={{
          position: 'relative',
          height: '60px',
          borderBottom: '1px solid #eee',
          padding: '4px',
          background: tasksInSlot.length > 0 ? '#E6F0FF' : 'white',
          cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
      >
        {tasksInSlot.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task)}
            onClick={() => {
              setEditingTask(task);
              setIsEditingTask(true);
            }}
            style={{
              background: getStatusColor(task.status),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '11px',
              cursor: 'move',
              position: 'relative',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              border: `2px solid ${getPriorityColor(task.priority)}`
            }}
            title={`${task.title}${task.description ? ` - ${task.description}` : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.title}
              </span>
              {task.goalId && (
                <span style={{ fontSize: '10px', opacity: 0.8 }}>🎯</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const closeEditModal = () => {
    setIsEditingTask(false);
    setEditingTask(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask.title.trim()) {
      showError('Task title is required');
      return;
    }
    await handleUpdateTask(editingTask.id, editingTask);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '24px',
          color: '#333',
          margin: 0
        }}>
          Weekly Planner
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setView('daily')}
            style={{
              background: view === 'daily' ? '#6495ED' : '#f8f9fa',
              color: view === 'daily' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <FaCalendarAlt /> Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            style={{
              background: view === 'weekly' ? '#6495ED' : '#f8f9fa',
              color: view === 'weekly' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <FaCalendarWeek /> Weekly
          </button>
          <button
            onClick={() => setIsAddingTask(true)}
            style={{
              background: '#6495ED',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <FaPlus /> Add Task
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'weekly' ? '100px repeat(7, 1fr)' : '100px 1fr',
        gap: '1px',
        background: '#eee',
        border: '1px solid #eee',
        borderRadius: '8px',
        overflow: 'hidden',
        overflowX: 'auto'
      }}>
        {/* Time Column */}
        <div style={{ background: 'white' }}>
          <div style={{
            padding: '12px',
            background: '#f8f9fa',
            borderBottom: '1px solid #eee',
            textAlign: 'center',
            fontWeight: 500,
            fontSize: '14px'
          }}>
            Time
          </div>
          {HOURS.map(hour => (
            <div
              key={hour}
              style={{
                padding: '4px 12px',
                borderBottom: '1px solid #eee',
                fontSize: '12px',
                color: '#666'
              }}
            >
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        {view === 'weekly' ? (
          DAYS.map((day, index) => (
            <div key={day} style={{ background: 'white' }}>
              <div style={{
                padding: '12px',
                background: '#f8f9fa',
                borderBottom: '1px solid #eee',
                textAlign: 'center',
                fontWeight: 500,
                fontSize: '14px'
              }}>
                {day}
              </div>
              {HOURS.map(hour => renderTimeSlot(index, hour))}
            </div>
          ))
        ) : (
          <div style={{ background: 'white' }}>
            <div style={{
              padding: '12px',
              background: '#f8f9fa',
              borderBottom: '1px solid #eee',
              textAlign: 'center',
              fontWeight: 500,
              fontSize: '14px'
            }}>
              {DAYS[selectedDay]}
            </div>
            {HOURS.map(hour => renderTimeSlot(selectedDay, hour))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '18px',
              color: '#333',
              marginBottom: '16px'
            }}>
              Add New Task
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                required
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: "'PT Sans', sans-serif"
                }}
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                rows="3"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />
              
              {/* Goal Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  Link to Goal (Optional)
                </label>
                <select
                  value={newTask.goalId}
                  onChange={(e) => setNewTask({ ...newTask, goalId: e.target.value })}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: "'PT Sans', sans-serif",
                    width: '100%'
                  }}
                >
                  <option value="">No Goal Linked</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Time Estimate (minutes)
                  </label>
                  <input
                    type="number"
                    value={newTask.timeEstimate}
                    onChange={(e) => setNewTask({ ...newTask, timeEstimate: e.target.value })}
                    placeholder="60"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {view === 'weekly' && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Day
                  </label>
                  <select
                    value={newTask.day}
                    onChange={(e) => setNewTask({ ...newTask, day: parseInt(e.target.value) })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  >
                    {DAYS.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <textarea
                value={newTask.notes}
                onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                placeholder="Additional notes (optional)"
                rows="2"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontFamily: "'PT Sans', sans-serif",
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#6495ED',
                    color: 'white',
                    cursor: 'pointer',
                    fontFamily: "'PT Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditingTask && editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: '18px',
                color: '#333',
                margin: 0
              }}>
                Edit Task
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDeleteTask(editingTask.id)}
                  style={{
                    background: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <FaTrash />
                </button>
                <button
                  onClick={closeEditModal}
                  style={{
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                placeholder="Task title"
                required
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: "'PT Sans', sans-serif"
                }}
              />
              <textarea
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                placeholder="Task description"
                rows="3"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />

              {/* Goal Selection */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  Link to Goal (Optional)
                </label>
                <select
                  value={editingTask.goalId || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, goalId: e.target.value })}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '14px',
                    fontFamily: "'PT Sans', sans-serif",
                    width: '100%'
                  }}
                >
                  <option value="">No Goal Linked</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editingTask.startTime}
                    onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editingTask.endTime}
                    onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Priority
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Time Estimate (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingTask.timeEstimate || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, timeEstimate: e.target.value })}
                    placeholder="60"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    Time Spent (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingTask.timeSpent || 0}
                    onChange={(e) => setEditingTask({ ...editingTask, timeSpent: parseInt(e.target.value) || 0 })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px',
                      fontFamily: "'PT Sans', sans-serif",
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              <textarea
                value={editingTask.notes || ''}
                onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                placeholder="Additional notes (optional)"
                rows="2"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontFamily: "'PT Sans', sans-serif",
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#6495ED',
                    color: 'white',
                    cursor: 'pointer',
                    fontFamily: "'PT Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Container */}
      <AlertContainer 
        alerts={alerts} 
        onRemoveAlert={removeAlert} 
        position="top-right" 
      />
    </div>
  );
}
