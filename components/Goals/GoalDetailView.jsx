import React, { useState, useEffect } from 'react';
import useAlert from '../../hooks/useAlert';
import AlertContainer from '../common/AlertContainer';

export default function GoalDetailView({ goal, onClose, onEdit, onDelete, onUpdateProgress }) {
  const [tasks, setTasks] = useState([]);
  const [relatedGoals, setRelatedGoals] = useState([]);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tasks, notes, analytics
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(() => {
    try {
      return goal.notes ? JSON.parse(goal.notes) : [];
    } catch (error) {
      console.error('Error parsing goal notes:', error);
      return [];
    }
  });

  // Task management state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    timeEstimate: '',
    timeSpent: '',
    dueDate: '',
    notes: ''
  });

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...goal });
  const [categories, setCategories] = useState([]);

  // Notes management state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Alert functionality
  const { alerts, showSuccess, showError, removeAlert } = useAlert();

  useEffect(() => {
    if (goal) {
      fetchGoalData();
      setEditForm({ 
        ...goal, 
        progress: parseInt(goal.progress) || 0 
      });
    }
    fetchCategories();
  }, [goal]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchGoalData = async () => {
    try {
      setIsLoading(true);
      const [tasksResponse, goalsResponse] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/goals')
      ]);

      if (tasksResponse.ok) {
        const allTasks = await tasksResponse.json();
        const goalTasks = allTasks.filter(task => task.goalId === goal.id);
        setTasks(goalTasks);
      }

      if (goalsResponse.ok) {
        const allGoals = await goalsResponse.json();
        // Find related goals based on dependencies
        let dependencies = [];
        try {
          dependencies = goal.dependencies ? JSON.parse(goal.dependencies) : [];
        } catch (error) {
          console.error('Error parsing goal dependencies:', error);
          dependencies = [];
        }
        const related = allGoals.filter(g => dependencies.includes(g.id));
        setRelatedGoals(related);
      }

      // Use the category data that's already available in the goal object
      if (goal.category) {
        setCategory(goal.category);
      }
    } catch (error) {
      console.error('Error fetching goal data:', error);
      setError('Failed to load goal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      text: newNote,
      timestamp: new Date().toISOString(),
      type: 'note'
    };
    
    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNewNote('');
    
    // Update goal with new notes
    const updatedGoal = { ...goal, notes: JSON.stringify(updatedNotes) };
    onUpdateProgress(updatedGoal);
  };

  const handleEditNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNoteId(noteId);
      setEditingNoteText(note.text);
    }
  };

  const handleUpdateNote = () => {
    if (!editingNoteText.trim()) return;
    
    const updatedNotes = notes.map(note => 
      note.id === editingNoteId 
        ? { ...note, text: editingNoteText, updatedAt: new Date().toISOString() }
        : note
    );
    
    setNotes(updatedNotes);
    setEditingNoteId(null);
    setEditingNoteText('');
    
    // Update goal with updated notes
    const updatedGoal = { ...goal, notes: JSON.stringify(updatedNotes) };
    onUpdateProgress(updatedGoal);
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      // Update goal with updated notes
      const updatedGoal = { ...goal, notes: JSON.stringify(updatedNotes) };
      onUpdateProgress(updatedGoal);
    }
  };

  const handleProgressUpdate = (newProgress) => {
    const updatedGoal = { ...goal, progress: newProgress };
    
    // Automatically update status based on progress
    if (newProgress === 100) {
      updatedGoal.status = 'Done';
      updatedGoal.completionDate = new Date().toISOString();
    } else if (newProgress > 0) {
      updatedGoal.status = 'In Progress';
    } else {
      updatedGoal.status = 'Not Started';
    }
    
    onUpdateProgress(updatedGoal);
  };

  // Task management functions
  const handleAddTask = async () => {
    try {
      const taskData = {
        ...newTask,
        goalId: goal.id,
        timeEstimate: newTask.timeEstimate ? parseInt(newTask.timeEstimate) : null,
        timeSpent: newTask.timeSpent ? parseInt(newTask.timeSpent) : 0,
        dueDate: newTask.dueDate || null
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        setNewTask({
          title: '',
          description: '',
          status: 'Not Started',
          priority: 'Medium',
          timeEstimate: '',
          timeSpent: '',
          dueDate: '',
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
      // Clean the update data to only include fields that can be updated
      const cleanUpdateData = {
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status,
        priority: updatedData.priority,
        timeEstimate: updatedData.timeEstimate ? parseInt(updatedData.timeEstimate) : null,
        timeSpent: updatedData.timeSpent ? parseInt(updatedData.timeSpent) : 0,
        dueDate: updatedData.dueDate || null,
        notes: updatedData.notes || '',
        tools: updatedData.tools || '',
        aiIntegration: updatedData.aiIntegration || false,
        optimizationSuggestions: updatedData.optimizationSuggestions || null,
        scheduledTime: updatedData.scheduledTime || null
      };

      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, ...cleanUpdateData })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
        setIsEditingTask(false);
        setEditingTask(null);
        showSuccess('Task updated successfully!');
      } else {
        console.error('Failed to update task:', await response.text());
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
        showSuccess('Task deleted successfully!');
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task. Please try again.');
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setIsEditingTask(true);
  };

  const closeTaskModal = () => {
    setIsAddingTask(false);
    setIsEditingTask(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      status: 'Not Started',
      priority: 'Medium',
      timeEstimate: '',
      timeSpent: '',
      dueDate: '',
      notes: ''
    });
  };

  const handleTaskInput = (e) => {
    const { name, value } = e.target;
    if (isEditingTask) {
      setEditingTask({ ...editingTask, [name]: value });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const calculateGoalStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const totalTimeSpent = tasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    const avgTaskDuration = completedTasks > 0 
      ? Math.round(totalTimeSpent / completedTasks) 
      : 0;
    
    return {
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalTimeSpent,
      avgTaskDuration
    };
  };

  const stats = calculateGoalStats();

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

  // Inline edit handlers
  const handleEditInput = (e) => {
    const { name, value, type } = e.target;
    
    // Convert progress to integer if it's a number input
    if (name === 'progress' && type === 'number') {
      setEditForm({ ...editForm, [name]: parseInt(value) || 0 });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleEditSave = async () => {
    try {
      // Convert progress to integer and clean the data
      const cleanEditData = {
        ...editForm,
        progress: parseInt(editForm.progress) || 0,
        notes: editForm.notes || '',
        dependencies: editForm.dependencies || null,
        completionDate: editForm.completionDate || null
      };

      // Automatically update status based on progress
      if (cleanEditData.progress === 100) {
        cleanEditData.status = 'Done';
        cleanEditData.completionDate = new Date().toISOString();
      } else if (cleanEditData.progress > 0) {
        cleanEditData.status = 'In Progress';
      } else {
        cleanEditData.status = 'Not Started';
      }

      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanEditData)
      });
      if (response.ok) {
        const updatedGoal = await response.json();
        setIsEditing(false);
        setEditForm(updatedGoal);
        onUpdateProgress(updatedGoal);
        showSuccess('Goal updated successfully!');
      } else {
        throw new Error('Failed to update goal');
      }
    } catch (error) {
      setError('Failed to update goal');
      showError('Failed to update goal. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({ 
      ...goal, 
      progress: parseInt(goal.progress) || 0 
    });
  };

  if (!goal) return null;

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading goal details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#F44336', fontFamily: "'PT Sans', sans-serif" }}>{error}</p>
        <button
          onClick={fetchGoalData}
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
    <div 
      style={{
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
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
          fontFamily: "'PT Sans', sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            fontSize: '32px',
            background: category?.color || '#6495ED',
            color: '#fff',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {category?.icon || '🎯'}
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <form style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditInput}
                  required
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    fontFamily: "'Poppins', sans-serif",
                    color: '#333',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '8px'
                  }}
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditInput}
                  placeholder="Description"
                  rows="2"
                  style={{
                    fontSize: '14px',
                    fontFamily: "'PT Sans', sans-serif",
                    color: '#666',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '8px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    name="categoryId"
                    value={editForm.categoryId}
                    onChange={handleEditInput}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontFamily: "'PT Sans', sans-serif"
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <select
                    name="timeframe"
                    value={editForm.timeframe}
                    onChange={handleEditInput}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontFamily: "'PT Sans', sans-serif"
                    }}
                  >
                    <option value="Short">Short-term</option>
                    <option value="Medium">Medium-term</option>
                    <option value="Long">Long-term</option>
                  </select>
                  <select
                    name="priority"
                    value={editForm.priority}
                    onChange={handleEditInput}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontFamily: "'PT Sans', sans-serif"
                    }}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditInput}
                    style={{
                      padding: '8px',
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
                    name="progress"
                    value={editForm.progress || 0}
                    onChange={handleEditInput}
                    min="0"
                    max="100"
                    style={{
                      width: '80px',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      fontFamily: "'PT Sans', sans-serif"
                    }}
                  />
                </div>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditInput}
                  placeholder="Notes (optional)"
                  rows="2"
                  style={{
                    fontFamily: "'PT Sans', sans-serif",
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '8px',
                    resize: 'vertical'
                  }}
                />
                
                {/* Status Change Indicator for Edit Mode */}
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#E6F0FF', 
                  borderRadius: '6px',
                  border: '1px solid #6495ED',
                  marginTop: '8px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '12px',
                    color: '#333'
                  }}>
                    <span>🔄</span>
                    <span>When you save, this goal will move to the <strong>{editForm.progress === 100 ? 'Done' : editForm.progress > 0 ? 'In Progress' : 'Not Started'}</strong> column</span>
                  </div>
                  {editForm.progress === 100 && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '11px',
                      color: '#4CAF50',
                      fontStyle: 'italic'
                    }}>
                      ✨ Goal will be marked as completed!
                    </div>
                  )}
                  {editForm.progress > 0 && editForm.progress < 100 && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '11px',
                      color: '#FF9800',
                      fontStyle: 'italic'
                    }}>
                      🔄 Goal will be marked as in progress!
                    </div>
                  )}
                  {editForm.progress === 0 && (
                    <div style={{ 
                      marginTop: '4px',
                      fontSize: '11px',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      📋 Goal will be marked as not started.
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" style={{ background: '#6495ED', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  <button type="button" onClick={handleEditCancel} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '24px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {goal.title}
                  </h2>
                  <span style={{
                    background: getStatusColor(goal.status),
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {goal.status}
                  </span>
                  <span style={{
                    background: getPriorityColor(goal.priority),
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {goal.priority}
                  </span>
                </div>
                {goal.description && (
                  <p style={{
                    margin: '0 0 8px 0',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    {goal.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                  <span>Category: {category?.name || 'Uncategorized'}</span>
                  <span>Timeframe: {goal.timeframe}</span>
                  <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {isEditing ? null : (
              <button
                onClick={() => setIsEditing(true)}
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
            )}
            <button
              onClick={() => onDelete(goal)}
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

        {/* Progress Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Progress: {goal.progress}%
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 25, 50, 75, 100].map((progress) => (
                <button
                  key={progress}
                  onClick={() => handleProgressUpdate(progress)}
                  style={{
                    background: goal.progress === progress ? '#6495ED' : '#E6F0FF',
                    color: goal.progress === progress ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {progress}%
                </button>
              ))}
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#E6F0FF',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${goal.progress}%`,
              height: '100%',
              background: '#6495ED',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          {/* Kanban Column Indicator */}
          <div style={{ 
            marginTop: '12px', 
            padding: '8px 12px', 
            background: '#f8f9fa', 
            borderRadius: '6px',
            border: '1px solid #E6F0FF'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>📍</span>
              <span>This goal will appear in the <strong>{goal.status}</strong> column in the kanban board</span>
            </div>
            {goal.progress === 100 && (
              <div style={{ 
                marginTop: '4px',
                fontSize: '11px',
                color: '#4CAF50',
                fontStyle: 'italic'
              }}>
                ✨ Goal completed! It will be moved to the Done column.
              </div>
            )}
            {goal.progress > 0 && goal.progress < 100 && (
              <div style={{ 
                marginTop: '4px',
                fontSize: '11px',
                color: '#FF9800',
                fontStyle: 'italic'
              }}>
                🔄 Goal in progress! It will be moved to the In Progress column.
              </div>
            )}
            {goal.progress === 0 && (
              <div style={{ 
                marginTop: '4px',
                fontSize: '11px',
                color: '#666',
                fontStyle: 'italic'
              }}>
                📋 Goal not started yet. It will remain in the Not Started column.
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          borderBottom: '2px solid #E6F0FF',
          paddingBottom: '8px'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'tasks', label: 'Tasks', icon: '📋' },
            { id: 'notes', label: 'Notes', icon: '📝' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: activeTab === tab.id ? '#6495ED' : '#E6F0FF',
                color: activeTab === tab.id ? '#fff' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: "'PT Sans', sans-serif",
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Goal Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #6495ED'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📋</div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#6495ED',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {stats.totalTasks}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Tasks</div>
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
                  {stats.taskCompletionRate}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Task Completion</div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #FF9800'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏱️</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#FF9800',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {formatTime(stats.totalTimeSpent)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Time Spent</div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #9C27B0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📅</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#9C27B0',
                  fontFamily: "'Poppins', sans-serif",
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: goal.timeframe === 'Short' ? '#E8F5E8' : 
                             goal.timeframe === 'Medium' ? '#FFF3E0' : '#E3F2FD',
                  border: `2px solid ${
                    goal.timeframe === 'Short' ? '#4CAF50' : 
                    goal.timeframe === 'Medium' ? '#FF9800' : '#2196F3'
                  }`
                }}>
                  {goal.timeframe || 'Not Set'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {goal.timeframe === 'Short' ? '1-4 weeks' :
                   goal.timeframe === 'Medium' ? '1-6 months' :
                   goal.timeframe === 'Long' ? '6+ months' : 'Timeframe'}
                </div>
              </div>
            </div>

            {/* Related Goals */}
            {relatedGoals.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  Related Goals ({relatedGoals.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {relatedGoals.map((relatedGoal) => (
                    <div
                      key={relatedGoal.id}
                      style={{
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '16px',
                        border: `2px solid ${getStatusColor(relatedGoal.status)}30`
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
                          {relatedGoal.title}
                        </h4>
                        <span style={{
                          background: getStatusColor(relatedGoal.status),
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {relatedGoal.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                        <span>Progress: {relatedGoal.progress}%</span>
                        <span>Priority: {relatedGoal.priority}</span>
                        <span>Timeframe: {relatedGoal.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                color: '#333',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600
              }}>
                Associated Tasks ({tasks.length})
              </h3>
              <button
                onClick={() => setIsAddingTask(true)}
                style={{
                  background: '#6495ED',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>➕</span>
                Add Task
              </button>
            </div>
            
            {tasks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#666',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ margin: 0 }}>No tasks associated with this goal</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  Create tasks to break down this goal into actionable steps
                </p>
                <button
                  onClick={() => setIsAddingTask(true)}
                  style={{
                    background: '#6495ED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '16px'
                  }}
                >
                  Create First Task
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '16px',
                      border: `2px solid ${task.status === 'Done' ? '#4CAF50' : task.status === 'In Progress' ? '#FF9800' : '#E6F0FF'}`
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
                        {task.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          background: task.status === 'Done' ? '#4CAF50' : task.status === 'In Progress' ? '#FF9800' : '#666',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          {task.status}
                        </span>
                        <button
                          onClick={() => openEditTask(task)}
                          style={{
                            background: '#6495ED',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          style={{
                            background: '#F44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {task.description && (
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                      <span>Priority: {task.priority}</span>
                      <span>Time Estimate: {formatTime(task.timeEstimate || 0)}</span>
                      <span>Time Spent: {formatTime(task.timeSpent || 0)}</span>
                      {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Notes & Comments
            </h3>
            
            {/* Add Note */}
            <div style={{ marginBottom: '24px' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note or comment..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical',
                  marginBottom: '8px'
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                style={{
                  background: '#6495ED',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: newNote.trim() ? 1 : 0.5
                }}
              >
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#666',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <p style={{ margin: 0 }}>No notes yet</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                    Add notes to track your thoughts and progress
                  </p>
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '2px solid #E6F0FF'
                    }}
                  >
                    {editingNoteId === note.id ? (
                      <div>
                        <textarea
                          value={editingNoteText}
                          onChange={(e) => setEditingNoteText(e.target.value)}
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #6495ED',
                            fontFamily: "'PT Sans', sans-serif",
                            resize: 'vertical',
                            marginBottom: '8px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleUpdateNote}
                            style={{
                              background: '#4CAF50',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontFamily: "'PT Sans', sans-serif",
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditNote}
                            style={{
                              background: '#FF9800',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontFamily: "'PT Sans', sans-serif",
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          color: '#333',
                          fontFamily: "'PT Sans', sans-serif"
                        }}>
                          {note.text}
                        </p>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            fontSize: '12px',
                            color: '#666',
                            fontFamily: "'PT Sans', sans-serif"
                          }}>
                            {new Date(note.timestamp).toLocaleString()}
                            {note.updatedAt && (
                              <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>
                                (edited {new Date(note.updatedAt).toLocaleString()})
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleEditNote(note.id)}
                              style={{
                                background: '#6495ED',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontFamily: "'PT Sans', sans-serif",
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              style={{
                                background: '#F44336',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontFamily: "'PT Sans', sans-serif",
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Goal Analytics
            </h3>
            
            {/* Analytics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #4CAF50'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📈</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {goal.progress}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Current Progress</div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #FF9800'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏱️</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#FF9800',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {formatTime(stats.totalTimeSpent)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Time Spent</div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #6495ED'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#6495ED',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {stats.taskCompletionRate}%
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Task Completion Rate</div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #9C27B0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📅</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#9C27B0',
                  fontFamily: "'Poppins', sans-serif",
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: goal.timeframe === 'Short' ? '#E8F5E8' : 
                             goal.timeframe === 'Medium' ? '#FFF3E0' : '#E3F2FD',
                  border: `2px solid ${
                    goal.timeframe === 'Short' ? '#4CAF50' : 
                    goal.timeframe === 'Medium' ? '#FF9800' : '#2196F3'
                  }`
                }}>
                  {goal.timeframe || 'Not Set'}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {goal.timeframe === 'Short' ? '1-4 weeks' :
                   goal.timeframe === 'Medium' ? '1-6 months' :
                   goal.timeframe === 'Long' ? '6+ months' : 'Timeframe'}
                </div>
              </div>
              
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                border: '2px solid #9C27B0'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>✅</div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#9C27B0',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {goal.completionDate ? new Date(goal.completionDate).toLocaleDateString() : 'Not completed'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Completion Date</div>
              </div>
            </div>

            {/* Category Performance */}
            {category && (
              <div style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${category.color}30`
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  Category Performance: {category.name}
                </h4>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                  <span>Category Color: {category.color}</span>
                  <span>Category Icon: {category.icon}</span>
                  {category.description && <span>Description: {category.description}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={closeTaskModal}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              minWidth: '400px',
              maxWidth: '90vw',
              boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
              fontFamily: "'PT Sans', sans-serif"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: '#6495ED',
              marginBottom: '16px'
            }}>
              Add New Task
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleTaskInput}
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
                name="description"
                value={newTask.description}
                onChange={handleTaskInput}
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
                  name="status"
                  value={newTask.status}
                  onChange={handleTaskInput}
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
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleTaskInput}
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
                <input
                  type="number"
                  name="timeEstimate"
                  value={newTask.timeEstimate}
                  onChange={handleTaskInput}
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
                  name="timeSpent"
                  value={newTask.timeSpent}
                  onChange={handleTaskInput}
                  placeholder="Time Spent (minutes)"
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
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleTaskInput}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontFamily: "'PT Sans', sans-serif"
                  }}
                />
              </div>
              <textarea
                name="notes"
                value={newTask.notes}
                onChange={handleTaskInput}
                placeholder="Task Notes (optional)"
                rows="2"
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />
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
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={closeTaskModal}
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
      )}

      {/* Edit Task Modal */}
      {isEditingTask && editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={closeTaskModal}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              minWidth: '400px',
              maxWidth: '90vw',
              boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
              fontFamily: "'PT Sans', sans-serif"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: '#6495ED',
              marginBottom: '16px'
            }}>
              Edit Task
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(editingTask.id, editingTask); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                name="title"
                value={editingTask.title}
                onChange={handleTaskInput}
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
                name="description"
                value={editingTask.description}
                onChange={handleTaskInput}
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
                  name="status"
                  value={editingTask.status}
                  onChange={handleTaskInput}
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
                <select
                  name="priority"
                  value={editingTask.priority}
                  onChange={handleTaskInput}
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
                <input
                  type="number"
                  name="timeEstimate"
                  value={editingTask.timeEstimate || ''}
                  onChange={handleTaskInput}
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
                  name="timeSpent"
                  value={editingTask.timeSpent || ''}
                  onChange={handleTaskInput}
                  placeholder="Time Spent (minutes)"
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
                  type="date"
                  name="dueDate"
                  value={editingTask.dueDate ? editingTask.dueDate.split('T')[0] : ''}
                  onChange={handleTaskInput}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontFamily: "'PT Sans', sans-serif"
                  }}
                />
              </div>
              <textarea
                name="notes"
                value={editingTask.notes || ''}
                onChange={handleTaskInput}
                placeholder="Task Notes (optional)"
                rows="2"
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />
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
                  Update Task
                </button>
                <button
                  type="button"
                  onClick={closeTaskModal}
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