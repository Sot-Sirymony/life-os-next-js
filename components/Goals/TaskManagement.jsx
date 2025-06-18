import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaExchangeAlt, FaClock, FaChartLine, FaRobot } from 'react-icons/fa';

export default function TaskManagement({ tasks, goals, onTasksChange, onGoalsChange }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(null);
  const [isMoving, setIsMoving] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [timeTracking, setTimeTracking] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterGoal, setFilterGoal] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleDuplicateTask = async (taskId) => {
    try {
      setIsDuplicating(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const duplicatedTask = {
        ...task,
        title: `${task.title} (Copy)`,
        status: 'Not Started',
        progress: 0,
        timeSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      delete duplicatedTask.id; // Remove ID so it creates a new one
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedTask),
      });

      if (response.ok) {
        const newTask = await response.json();
        onTasksChange([...tasks, newTask]);
      } else {
        throw new Error('Failed to duplicate task');
      }
    } catch (error) {
      console.error('Error duplicating task:', error);
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleMoveTask = async (taskId, newGoalId) => {
    try {
      setIsMoving(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        goalId: newGoalId,
        updatedAt: new Date().toISOString()
      };
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const updatedTasks = tasks.map(t => 
          t.id === taskId ? updatedTask : t
        );
        onTasksChange(updatedTasks);
      } else {
        throw new Error('Failed to move task');
      }
    } catch (error) {
      console.error('Error moving task:', error);
    } finally {
      setIsMoving(null);
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmAction({ type: 'delete', taskId });
    setShowConfirmDialog(true);
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    try {
      const { type, taskId } = confirmAction;
      
      if (type === 'delete') {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedTasks = tasks.filter(t => t.id !== taskId);
          onTasksChange(updatedTasks);
        } else {
          throw new Error('Failed to delete task');
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  const startTimeTracking = (taskId) => {
    setTimeTracking(prev => ({
      ...prev,
      [taskId]: {
        startTime: Date.now(),
        isTracking: true
      }
    }));
  };

  const stopTimeTracking = (taskId) => {
    const tracking = timeTracking[taskId];
    if (!tracking) return;

    const timeSpent = Math.floor((Date.now() - tracking.startTime) / 60000); // Convert to minutes
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = {
        ...task,
        timeSpent: (parseInt(task.timeSpent) || 0) + timeSpent,
        updatedAt: new Date().toISOString()
      };
      
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? updatedTask : t
      );
      onTasksChange(updatedTasks);
    }

    setTimeTracking(prev => ({
      ...prev,
      [taskId]: { isTracking: false }
    }));
  };

  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;

    // Apply filters
    if (filterStatus !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }
    if (filterGoal !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.goalId === filterGoal);
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'dueDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredTasks;
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

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const filteredTasks = getFilteredAndSortedTasks();

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
        Task Management
      </h2>

      {/* Filters and Sorting */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterGoal}
          onChange={(e) => setFilterGoal(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Goals</option>
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="createdAt">Created Date</option>
          <option value="updatedAt">Updated Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="progress">Progress</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            background: '#fff',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.map((task) => {
          const parentGoal = goals.find(g => g.id === task.goalId);
          const isTracking = timeTracking[task.id]?.isTracking;
          
          return (
            <div
              key={task.id}
              style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${getStatusColor(task.status)}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Task Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {task.title}
                  </h3>
                  <span style={{
                    background: getStatusColor(task.status),
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {task.status}
                  </span>
                  <span style={{
                    background: getPriorityColor(task.priority),
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {task.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                  <span>Goal: {parentGoal?.title || 'Unknown'}</span>
                  <span>Progress: {task.progress || 0}%</span>
                  <span>Estimate: {formatTime(task.timeEstimate || 0)}</span>
                  <span>Spent: {formatTime(task.timeSpent || 0)}</span>
                  {task.dueDate && (
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#E6F0FF',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${task.progress || 0}%`,
                    height: '100%',
                    background: getPriorityColor(task.priority),
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => setSelectedTask(task)}
                  disabled={isDuplicating === task.id || isMoving === task.id}
                  style={{
                    background: '#6495ED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: (isDuplicating === task.id || isMoving === task.id) ? 0.5 : 1
                  }}
                >
                  <FaEdit />
                </button>
                
                <button
                  onClick={() => handleDuplicateTask(task.id)}
                  disabled={isDuplicating === task.id}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: isDuplicating === task.id ? 0.5 : 1
                  }}
                >
                  {isDuplicating === task.id ? '...' : <FaCopy />}
                </button>
                
                <button
                  onClick={() => isTracking ? stopTimeTracking(task.id) : startTimeTracking(task.id)}
                  style={{
                    background: isTracking ? '#F44336' : '#FF9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <FaClock />
                </button>
                
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={isDuplicating === task.id || isMoving === task.id}
                  style={{
                    background: '#F44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: (isDuplicating === task.id || isMoving === task.id) ? 0.5 : 1
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Edit Modal */}
      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          goals={goals}
          onSave={(updatedTask) => {
            const updatedTasks = tasks.map(t => 
              t.id === updatedTask.id ? updatedTask : t
            );
            onTasksChange(updatedTasks);
            setSelectedTask(null);
          }}
          onCancel={() => setSelectedTask(null)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
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
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
            textAlign: 'center',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Delete Task
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: '#666',
              fontSize: '14px'
            }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmActionHandler}
                style={{
                  background: '#F44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  background: '#eee',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Task Edit Modal Component
function TaskEditModal({ task, goals, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    goalId: task.goalId,
    priority: task.priority || 'Medium',
    status: task.status || 'Not Started',
    progress: task.progress || 0,
    timeEstimate: task.timeEstimate || '',
    timeSpent: task.timeSpent || 0,
    dueDate: task.dueDate || '',
    notes: task.notes || '',
    toolsRequired: task.toolsRequired || '',
    aiIntegration: task.aiIntegration || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...task, ...formData });
  };

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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
        fontFamily: "'PT Sans', sans-serif"
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Edit Task
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Task Title"
            required
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: "'PT Sans', sans-serif"
            }}
          />
          
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Task Description (optional)"
            rows="3"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: "'PT Sans', sans-serif",
              resize: 'vertical'
            }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select
              value={formData.goalId}
              onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif"
              }}
            >
              <option value="">Select Goal</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
            
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif"
              }}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif"
              }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            
            <input
              type="number"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              placeholder="Progress (0-100)"
              min="0"
              max="100"
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif"
              }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input
              type="number"
              value={formData.timeEstimate}
              onChange={(e) => setFormData({ ...formData, timeEstimate: e.target.value })}
              placeholder="Time Estimate (minutes)"
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif"
              }}
            />
            
            <input
              type="number"
              value={formData.timeSpent}
              onChange={(e) => setFormData({ ...formData, timeSpent: parseInt(e.target.value) })}
              placeholder="Time Spent (minutes)"
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif"
              }}
            />
          </div>
          
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: "'PT Sans', sans-serif"
            }}
          />
          
          <input
            type="text"
            value={formData.toolsRequired}
            onChange={(e) => setFormData({ ...formData, toolsRequired: e.target.value })}
            placeholder="Tools Required"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: "'PT Sans', sans-serif"
            }}
          />
          
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes (optional)"
            rows="3"
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontFamily: "'PT Sans', sans-serif",
              resize: 'vertical'
            }}
          />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="checkbox"
              checked={formData.aiIntegration}
              onChange={(e) => setFormData({ ...formData, aiIntegration: e.target.checked })}
              id="aiIntegration"
            />
            <label htmlFor="aiIntegration" style={{ fontSize: '14px', color: '#666' }}>
              Enable AI optimization
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              style={{
                background: '#6495ED',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                flex: 1
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                cursor: 'pointer',
                flex: 1
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 