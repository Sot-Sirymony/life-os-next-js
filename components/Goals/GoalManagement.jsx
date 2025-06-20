import React, { useState, useEffect } from 'react';

export default function GoalManagement({ goals, onGoalsChange }) {
  const [editingGoal, setEditingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isArchiving, setIsArchiving] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (retryCount = 0) => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories from /api/categories... (attempt', retryCount + 1, ')');
      const response = await fetch('/api/categories');
      console.log('Categories response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetched successfully:', data.length, 'categories');
        setCategories(data);
        setError(null); // Clear any previous errors
      } else {
        console.error('Failed to fetch categories. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (retryCount < 2) {
          console.log('Retrying fetch categories in 1 second...');
          setTimeout(() => fetchCategories(retryCount + 1), 1000);
        } else {
          setError('Failed to load categories after multiple attempts');
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (retryCount < 2) {
        console.log('Retrying fetch categories in 1 second due to network error...');
        setTimeout(() => fetchCategories(retryCount + 1), 1000);
      } else {
        setError('Network error: Unable to load categories after multiple attempts');
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
  };

  const handleDelete = (goal) => {
    setConfirmAction({ type: 'delete', goal });
    setShowConfirmDialog(true);
  };

  const handleArchive = (goal) => {
    setConfirmAction({ type: 'archive', goal });
    setShowConfirmDialog(true);
  };

  const handleDuplicate = async (goal) => {
    try {
      setIsDuplicating(goal.id);
      const duplicatedGoal = {
        ...goal,
        title: `${goal.title} (Copy)`,
        status: 'Not Started',
        progress: 0,
        completionDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      delete duplicatedGoal.id; // Remove ID so it creates a new one
      
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedGoal),
      });

      if (response.ok) {
        const newGoal = await response.json();
        onGoalsChange([...goals, newGoal]);
      } else {
        throw new Error('Failed to duplicate goal');
      }
    } catch (error) {
      console.error('Error duplicating goal:', error);
      setError('Failed to duplicate goal');
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleExport = (goal) => {
    const goalData = {
      ...goal,
      exportDate: new Date().toISOString(),
      category: categories.find(c => c.id === goal.categoryId)
    };
    
    const dataStr = JSON.stringify(goalData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${goal.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_goal.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    try {
      const { type, goal } = confirmAction;
      
      if (type === 'delete') {
        setIsDeleting(goal.id);
        const response = await fetch('/api/goals', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: goal.id }),
        });

        if (response.ok) {
          const updatedGoals = goals.filter(g => g.id !== goal.id);
          onGoalsChange(updatedGoals);
        } else {
          throw new Error('Failed to delete goal');
        }
        setIsDeleting(null);
      } else if (type === 'archive') {
        setIsArchiving(goal.id);
        const response = await fetch('/api/goals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...goal, isArchived: true }),
        });

        if (response.ok) {
          const updatedGoalData = await response.json();
          const updatedGoals = goals.map(g => 
            g.id === goal.id ? updatedGoalData : g
          );
          onGoalsChange(updatedGoals);
        } else {
          throw new Error('Failed to archive goal');
        }
        setIsArchiving(null);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setError(`Failed to ${confirmAction.type} goal`);
    } finally {
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  const handleSaveEdit = async (updatedGoal) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGoal),
      });

      if (response.ok) {
        const updatedGoalData = await response.json();
        const updatedGoals = goals.map(g => 
          g.id === updatedGoal.id ? updatedGoalData : g
        );
        onGoalsChange(updatedGoals);
        setEditingGoal(null);
      } else {
        throw new Error('Failed to update goal');
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      setError('Failed to update goal');
    }
  };

  const getFilteredAndSortedGoals = () => {
    let filteredGoals = goals;

    // Apply filters
    if (filterStatus !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.priority === filterPriority);
    }
    if (filterCategory !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.categoryId === filterCategory);
    }

    // Apply sorting
    filteredGoals.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'completionDate') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredGoals;
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

  const filteredGoals = getFilteredAndSortedGoals();

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
        Goal Management
      </h2>

      {error && (
        <div style={{
          background: '#FFEBEE',
          color: '#F44336',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#F44336',
              marginLeft: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {categoriesLoading && (
        <div style={{
          background: '#E3F2FD',
          color: '#1976D2',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontFamily: "'PT Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ fontSize: '16px' }}>⏳</div>
          Loading categories...
        </div>
      )}

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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
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
          <option value="title">Title</option>
          <option value="priority">Priority</option>
          <option value="progress">Progress</option>
          <option value="completionDate">Completion Date</option>
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

      {/* Goals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredGoals.map((goal) => {
          const category = categories.find(c => c.id === goal.categoryId);
          return (
            <div
              key={goal.id}
              style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${category?.color || '#E6F0FF'}30`,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative'
              }}
            >
              {/* Goal Icon */}
              <div style={{
                fontSize: '24px',
                background: category?.color || '#6495ED',
                color: '#fff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {category?.icon || '🎯'}
              </div>

              {/* Goal Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {goal.title}
                  </h3>
                  <span style={{
                    background: getStatusColor(goal.status),
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {goal.status}
                  </span>
                  <span style={{
                    background: getPriorityColor(goal.priority),
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {goal.priority}
                  </span>
                  {goal.isArchived && (
                    <span style={{
                      background: '#666',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      Archived
                    </span>
                  )}
                </div>
                {goal.description && (
                  <p style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {goal.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                  <span>Category: {category?.name || 'Uncategorized'}</span>
                  <span>Progress: {goal.progress}%</span>
                  <span>Timeframe: {goal.timeframe}</span>
                  <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                  {goal.completionDate && (
                    <span>Completed: {new Date(goal.completionDate).toLocaleDateString()}</span>
                  )}
                  {goal.updatedAt && goal.updatedAt !== goal.createdAt && (
                    <span>Updated: {new Date(goal.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
                {goal.notes && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '8px', 
                    background: '#fff', 
                    borderRadius: '4px',
                    border: '1px solid #E6F0FF',
                    fontSize: '12px',
                    color: '#666',
                    maxHeight: '60px',
                    overflow: 'hidden'
                  }}>
                    <strong>Notes:</strong> {goal.notes.length > 100 ? `${goal.notes.substring(0, 100)}...` : goal.notes}
                  </div>
                )}
                {goal.dependencies && (
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '12px', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    <strong>Dependencies:</strong> {goal.dependencies}
                  </div>
                )}
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
                    width: `${goal.progress}%`,
                    height: '100%',
                    background: category?.color || '#6495ED',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleEdit(goal)}
                  disabled={isDeleting === goal.id || isArchiving === goal.id}
                  style={{
                    background: '#6495ED',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: (isDeleting === goal.id || isArchiving === goal.id) ? 0.5 : 1
                  }}
                >
                  Edit
                </button>
                
                <button
                  onClick={() => handleDuplicate(goal)}
                  disabled={isDuplicating === goal.id}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: isDuplicating === goal.id ? 0.5 : 1
                  }}
                >
                  {isDuplicating === goal.id ? 'Copying...' : 'Duplicate'}
                </button>
                
                <button
                  onClick={() => handleExport(goal)}
                  style={{
                    background: '#9C27B0',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Export
                </button>
                
                <button
                  onClick={() => handleArchive(goal)}
                  disabled={isDeleting === goal.id || isArchiving === goal.id}
                  style={{
                    background: '#FF9800',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: (isDeleting === goal.id || isArchiving === goal.id) ? 0.5 : 1
                  }}
                >
                  {isArchiving === goal.id ? 'Archiving...' : 'Archive'}
                </button>
                
                <button
                  onClick={() => handleDelete(goal)}
                  disabled={isDeleting === goal.id || isArchiving === goal.id}
                  style={{
                    background: '#F44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    fontFamily: "'PT Sans', sans-serif",
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: (isDeleting === goal.id || isArchiving === goal.id) ? 0.5 : 1
                  }}
                >
                  {isDeleting === goal.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
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
              Edit Goal
            </h3>
            <GoalEditForm
              goal={editingGoal}
              categories={categories}
              onSave={handleSaveEdit}
              onCancel={() => setEditingGoal(null)}
            />
          </div>
        </div>
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {confirmAction.type === 'delete' ? '⚠️' : '📦'}
            </div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {confirmAction.type === 'delete' ? 'Delete Goal' : 'Archive Goal'}
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: '#666',
              fontSize: '14px'
            }}>
              Are you sure you want to {confirmAction.type} "{confirmAction.goal.title}"?
              {confirmAction.type === 'delete' && ' This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmActionHandler}
                style={{
                  background: confirmAction.type === 'delete' ? '#F44336' : '#FF9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {confirmAction.type === 'delete' ? 'Delete' : 'Archive'}
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

// Goal Edit Form Component
function GoalEditForm({ goal, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: goal.title,
    description: goal.description || '',
    categoryId: goal.categoryId,
    status: goal.status,
    timeframe: goal.timeframe,
    priority: goal.priority,
    progress: goal.progress,
    notes: goal.notes || '',
    dependencies: goal.dependencies || '',
    completionDate: goal.completionDate || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up the data before saving
    const cleanData = {
      ...goal,
      ...formData,
      progress: parseInt(formData.progress) || 0,
      notes: formData.notes || '',
      dependencies: formData.dependencies || null,
      completionDate: formData.completionDate || null
    };
    
    // Auto-update status based on progress
    if (cleanData.progress === 100) {
      cleanData.status = 'Done';
      cleanData.completionDate = new Date().toISOString();
    } else if (cleanData.progress > 0) {
      cleanData.status = 'In Progress';
    } else {
      cleanData.status = 'Not Started';
    }
    
    onSave(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Goal Title"
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
        placeholder="Goal Description (optional)"
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
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          required
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif"
          }}
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <select
          value={formData.timeframe}
          onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
          required
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif"
          }}
        >
          <option value="Short">Short-term</option>
          <option value="Medium">Medium-term</option>
          <option value="Long">Long-term</option>
        </select>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input
          type="number"
          value={formData.progress}
          onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
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
        
        <input
          type="date"
          value={formData.completionDate ? formData.completionDate.split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, completionDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
          placeholder="Completion Date (optional)"
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif"
          }}
        />
      </div>
      
      <textarea
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="Notes (optional) - Add your thoughts, progress updates, or important information"
        rows="4"
        style={{
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontFamily: "'PT Sans', sans-serif",
          resize: 'vertical'
        }}
      />
      
      <textarea
        value={formData.dependencies}
        onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
        placeholder="Dependencies (optional) - List other goals or tasks that must be completed first"
        rows="3"
        style={{
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontFamily: "'PT Sans', sans-serif",
          resize: 'vertical'
        }}
      />
      
      {/* Status Change Indicator */}
      <div style={{ 
        padding: '8px 12px', 
        background: '#E6F0FF', 
        borderRadius: '6px',
        border: '1px solid #6495ED',
        fontSize: '14px',
        color: '#333'
      }}>
        <strong>💡 Tip:</strong> When you set progress to 100%, the status will automatically change to "Done" and set the completion date.
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
  );
} 