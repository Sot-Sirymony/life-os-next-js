import React, { useState, useEffect } from 'react';

export default function GoalDetailView({ goal, onClose, onEdit, onDelete, onUpdateProgress }) {
  const [tasks, setTasks] = useState([]);
  const [relatedGoals, setRelatedGoals] = useState([]);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tasks, notes, analytics
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(goal.notes ? JSON.parse(goal.notes) : []);

  useEffect(() => {
    if (goal) {
      fetchGoalData();
    }
  }, [goal]);

  const fetchGoalData = async () => {
    try {
      setIsLoading(true);
      const [tasksResponse, goalsResponse, categoryResponse] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/goals'),
        fetch(`/api/categories/${goal.categoryId}`)
      ]);

      if (tasksResponse.ok) {
        const allTasks = await tasksResponse.json();
        const goalTasks = allTasks.filter(task => task.goalId === goal.id);
        setTasks(goalTasks);
      }

      if (goalsResponse.ok) {
        const allGoals = await goalsResponse.json();
        // Find related goals based on dependencies
        const dependencies = goal.dependencies ? JSON.parse(goal.dependencies) : [];
        const related = allGoals.filter(g => dependencies.includes(g.id));
        setRelatedGoals(related);
      }

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        setCategory(categoryData);
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

  const handleProgressUpdate = (newProgress) => {
    const updatedGoal = { ...goal, progress: newProgress };
    if (newProgress === 100) {
      updatedGoal.status = 'Done';
      updatedGoal.completionDate = new Date().toISOString();
    } else if (newProgress > 0) {
      updatedGoal.status = 'In Progress';
    }
    onUpdateProgress(updatedGoal);
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
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
        fontFamily: "'PT Sans', sans-serif"
      }}>
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
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => onEdit(goal)}
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
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  {goal.timeframe}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Timeframe</div>
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
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Associated Tasks ({tasks.length})
            </h3>
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
                    <p style={{
                      margin: '0 0 8px 0',
                      fontSize: '14px',
                      color: '#333',
                      fontFamily: "'PT Sans', sans-serif"
                    }}>
                      {note.text}
                    </p>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      fontFamily: "'PT Sans', sans-serif"
                    }}>
                      {new Date(note.timestamp).toLocaleString()}
                    </div>
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
    </div>
  );
} 