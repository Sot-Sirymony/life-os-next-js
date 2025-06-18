import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGripVertical, FaRobot, FaLightbulb } from 'react-icons/fa';

export default function SubTasks({ tasks = [], onTasksChange, parentGoalId }) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    timeEstimate: '',
    toolsRequired: '',
    aiIntegration: false,
    roadblocks: [],
    optimizationSuggestions: []
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddTask = () => {
    if (newTask.description.trim()) {
      const taskToAdd = {
        id: Date.now(),
        ...newTask,
        status: 'Not Started',
        parentGoalId,
        roadblocks: [],
        optimizationSuggestions: []
      };
      onTasksChange([...tasks, taskToAdd]);
      setNewTask({
        description: '',
        timeEstimate: '',
        toolsRequired: '',
        aiIntegration: false,
        roadblocks: [],
        optimizationSuggestions: []
      });
      setIsAddingTask(false);
    }
  };

  const handleEditTask = (taskId, field, value) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, [field]: value } : task
    );
    onTasksChange(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onTasksChange(updatedTasks);
  };

  const handleDragStart = (taskId) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetTaskId) => {
    if (draggedTask === targetTaskId) return;

    const draggedTaskIndex = tasks.findIndex(task => task.id === draggedTask);
    const targetTaskIndex = tasks.findIndex(task => task.id === targetTaskId);

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(draggedTaskIndex, 1);
    newTasks.splice(targetTaskIndex, 0, movedTask);

    onTasksChange(newTasks);
    setDraggedTask(null);
  };

  const handleAIOptimization = (taskId) => {
    // Simulate AI analysis and suggestions
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const suggestions = [
      "Break down into smaller steps",
      "Identify potential roadblocks early",
      "Set specific milestones",
      "Use the Pomodoro technique",
      "Find an accountability partner"
    ];

    const updatedTasks = tasks.map(t =>
      t.id === taskId ? {
        ...t,
        optimizationSuggestions: suggestions,
        aiIntegration: true
      } : t
    );
    onTasksChange(updatedTasks);
  };

  return (
    <div style={{
      marginTop: '16px',
      background: '#f8f9fa',
      borderRadius: '8px',
      padding: '16px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '16px',
          color: '#333',
          margin: 0
        }}>
          Sub-tasks
        </h3>
        <button
          onClick={() => setIsAddingTask(true)}
          style={{
            background: '#6495ED',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
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

      {/* Task List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(task.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '12px',
              background: 'white',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'move'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaGripVertical style={{ color: '#666' }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <input
                    type="text"
                    value={task.description}
                    onChange={(e) => handleEditTask(task.id, 'description', e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      color: '#333',
                      width: '100%',
                      padding: '4px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task.id, 'status', 
                          task.status === 'Not Started' ? 'In Progress' :
                          task.status === 'In Progress' ? 'Done' : 'Not Started'
                        );
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: task.status === 'Done' ? '#E6F0FF' : 
                                  task.status === 'In Progress' ? '#F0E6FF' : '#f8f9fa',
                        color: task.status === 'Done' ? '#6495ED' : 
                              task.status === 'In Progress' ? '#D8BFD8' : '#666',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {task.status}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAIOptimization(task.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: task.aiIntegration ? '#E6F0FF' : '#f8f9fa',
                        color: task.aiIntegration ? '#6495ED' : '#666',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FaRobot /> Optimize
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#f8f9fa',
                        color: '#666',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <input
                    type="text"
                    value={task.timeEstimate}
                    onChange={(e) => handleEditTask(task.id, 'timeEstimate', e.target.value)}
                    placeholder="Time estimate (minutes)"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      width: '120px'
                    }}
                  />
                  <input
                    type="text"
                    value={task.toolsRequired}
                    onChange={(e) => handleEditTask(task.id, 'toolsRequired', e.target.value)}
                    placeholder="Tools required"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      width: '120px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* AI Optimization Suggestions */}
            {task.aiIntegration && task.optimizationSuggestions.length > 0 && (
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
                  <FaLightbulb /> Optimization Suggestions
                </div>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  {task.optimizationSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '18px',
              color: '#333',
              marginBottom: '16px'
            }}>
              Add New Sub-task
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <input
                type="text"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                value={newTask.timeEstimate}
                onChange={(e) => setNewTask({ ...newTask, timeEstimate: e.target.value })}
                placeholder="Time estimate (minutes)"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                value={newTask.toolsRequired}
                onChange={(e) => setNewTask({ ...newTask, toolsRequired: e.target.value })}
                placeholder="Tools required"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px'
                }}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <input
                  type="checkbox"
                  checked={newTask.aiIntegration}
                  onChange={(e) => setNewTask({ ...newTask, aiIntegration: e.target.checked })}
                  id="aiIntegration"
                />
                <label htmlFor="aiIntegration" style={{ fontSize: '14px', color: '#666' }}>
                  Enable AI optimization
                </label>
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setIsAddingTask(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6495ED',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 