"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaLink, FaComment, FaShare, FaCalendar } from "react-icons/fa";
import SubTasks from "./SubTasks";
import { goalsApi } from "@/lib/api";

const initialStatuses = ["Not Started", "In Progress", "Done"];

const categoryGroups = {
  Foundations: [
    { id: 'self-dev', name: 'Self-Development & Learning', icon: '📚' },
    { id: 'health', name: 'Health & Wellness', icon: '💪' },
    { id: 'financial', name: 'Financial Security', icon: '💰' },
    { id: 'personal', name: 'Personal Growth', icon: '🌱' }
  ],
  'People & Impact': [
    { id: 'relationships', name: 'Relationships', icon: '❤️' },
    { id: 'community', name: 'Community Involvement', icon: '🤝' },
    { id: 'social', name: 'Social Connection', icon: '👥' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' }
  ],
  'Achievement & Enjoyment': [
    { id: 'career', name: 'Career & Professional Growth', icon: '💼' },
    { id: 'hobbies', name: 'Hobbies & Recreation', icon: '🎨' },
    { id: 'travel', name: 'Travel & Adventure', icon: '✈️' },
    { id: 'creative', name: 'Creative Expression', icon: '🎭' }
  ]
};

// Flatten categories for the select dropdown
const allCategories = Object.values(categoryGroups).flat().map(cat => cat.name);

function getStatusColor(status) {
  if (status === "Not Started") return "#E6F0FF";
  if (status === "In Progress") return "#D8BFD8";
  if (status === "Done") return "#6495ED";
  return "#eee";
}

export default function LifeGoalsBoard() {
  const [goals, setGoals] = useState([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Self-Development & Learning",
    status: "Not Started",
    progress: 0,
    timeframe: "Short",
    priority: "Medium",
    notes: "",
    dependencies: [],
    completionDate: null
  });
  const [draggedGoal, setDraggedGoal] = useState(null);
  const [modalGoal, setModalGoal] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    timeframe: 'all',
    status: 'all'
  });
  const [sortBy, setSortBy] = useState('priority'); // 'priority', 'timeframe', 'title'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubtasks, setShowSubtasks] = useState({});
  const [showNotes, setShowNotes] = useState({});
  const [showDependencies, setShowDependencies] = useState({});
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleAddGoal = async () => {
    try {
      if (!newGoal.title || !newGoal.category) {
        console.error("Title and category are required");
        return;
      }

      const createdGoal = await goalsApi.create(newGoal);
      setGoals([...goals, createdGoal]);
      setIsAddingGoal(false);
      setNewGoal({
        title: "",
        description: "",
        category: "Self-Development & Learning",
        status: "Not Started",
        progress: 0,
        timeframe: "Short",
        priority: "Medium",
        notes: "",
        dependencies: [],
        completionDate: null
      });
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const handleUpdateGoal = async (goal) => {
    try {
      const updatedGoal = await goalsApi.update(goal.id, goal);
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      setIsEditingGoal(false);
      setCurrentGoal(null);
    } catch (error) {
      console.error("Failed to update goal:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsApi.delete(id);
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (error) {
      console.error("Failed to delete goal:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleTasksChange = async (goalId, tasks) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const updatedGoal = await goalsApi.update(goalId, { ...goal, tasks });
        setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (error) {
      console.error("Failed to update tasks:", error);
      // You might want to show an error message to the user here
    }
  };

  function handleInput(e) {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  }

  function onDragStart(goal) {
    setDraggedGoal(goal);
  }

  function onDrop(status) {
    if (draggedGoal) {
      setGoals(goals.map(g => g.id === draggedGoal.id ? { ...g, status } : g));
      setDraggedGoal(null);
    }
  }

  function openEditModal(goal) {
    setModalGoal(goal);
    setEditForm({ ...goal });
  }

  function closeModal() {
    setModalGoal(null);
    setEditForm(null);
  }

  function handleEditInput(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleEditGoal(e) {
    e.preventDefault();
    setGoals(goals.map(g => g.id === editForm.id ? { ...editForm } : g));
    closeModal();
  }

  // Add this after the existing state declarations
  const filteredAndSortedGoals = goals
    .filter(goal => {
      // Search filter
      if (searchQuery && !goal.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !goal.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Existing filters
      if (filters.category !== 'all' && goal.category !== filters.category) return false;
      if (filters.priority !== 'all' && goal.priority !== filters.priority) return false;
      if (filters.timeframe !== 'all' && goal.timeframe !== filters.timeframe) return false;
      if (filters.status !== 'all' && goal.status !== filters.status) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'timeframe':
          const timeframeOrder = { 'Long-Term': 3, 'Mid-Term': 2, 'Short': 1 };
          return timeframeOrder[b.timeframe] - timeframeOrder[a.timeframe];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // Add this before the return statement
  const renderProgressBar = (progress) => (
    <div style={{ 
      width: '100%', 
      height: '6px', 
      background: '#f0f0f0', 
      borderRadius: '3px',
      marginTop: '8px'
    }}>
      <div style={{ 
        width: `${progress}%`, 
        height: '100%', 
        background: '#6495ed', 
        borderRadius: '3px',
        transition: 'width 0.3s ease'
      }} />
    </div>
  );

  // Add this before the return statement
  const renderKanbanView = () => (
    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px 0' }}>
      {initialStatuses.map(status => (
        <div
          key={status}
          style={{
            minWidth: '300px',
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '16px',
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(status)}
        >
          <h3 style={{ marginBottom: '16px', color: '#333' }}>{status}</h3>
          {filteredAndSortedGoals
            .filter(goal => goal.status === status)
            .map(goal => (
              <div
                key={goal.id}
                draggable
                onDragStart={() => onDragStart(goal)}
                style={{
                  background: '#fff',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'move',
                }}
              >
                <h4 style={{ margin: '0 0 8px 0' }}>{goal.title}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  {goal.description}
                </p>
                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ background: '#e6f0ff', padding: '2px 6px', borderRadius: '4px' }}>
                    {goal.category}
                  </span>
                  <span style={{ background: '#d8bfd8', padding: '2px 6px', borderRadius: '4px' }}>
                    {goal.priority}
                  </span>
                  <span style={{ background: '#6495ed', padding: '2px 6px', borderRadius: '4px' }}>
                    {goal.timeframe}
                  </span>
                </div>
                {renderProgressBar(goal.progress)}
                <button
                  onClick={() => setShowSubtasks({ ...showSubtasks, [goal.id]: !showSubtasks[goal.id] })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6495ed',
                    cursor: 'pointer',
                    padding: '4px 0',
                    marginTop: '8px',
                    fontSize: '12px'
                  }}
                >
                  {showSubtasks[goal.id] ? 'Hide Subtasks' : 'Show Subtasks'}
                </button>
                {showSubtasks[goal.id] && (
                  <div style={{ marginTop: '8px' }}>
                    <SubTasks
                      tasks={goal.tasks || []}
                      onTasksChange={(tasks) => handleTasksChange(goal.id, tasks)}
                      parentGoalId={goal.id}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div style={{ padding: '16px 0' }}>
      {filteredAndSortedGoals.map(goal => (
        <div
          key={goal.id}
          style={{
            background: '#fff',
            padding: '16px',
            marginBottom: '12px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{goal.title}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => openEditModal(goal)}
                style={{ padding: '4px 8px', background: '#e6f0ff', border: 'none', borderRadius: '4px' }}
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteGoal(goal.id)}
                style={{ padding: '4px 8px', background: '#ffebee', border: 'none', borderRadius: '4px' }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <p style={{ margin: '8px 0', color: '#666' }}>{goal.description}</p>
          <div style={{ display: 'flex', gap: '8px', fontSize: '14px', marginBottom: '8px' }}>
            <span style={{ background: '#e6f0ff', padding: '4px 8px', borderRadius: '4px' }}>
              {goal.category}
            </span>
            <span style={{ background: '#d8bfd8', padding: '4px 8px', borderRadius: '4px' }}>
              {goal.priority}
            </span>
            <span style={{ background: '#6495ed', padding: '4px 8px', borderRadius: '4px' }}>
              {goal.timeframe}
            </span>
            <span style={{ background: getStatusColor(goal.status), padding: '4px 8px', borderRadius: '4px' }}>
              {goal.status}
            </span>
          </div>
          {renderProgressBar(goal.progress)}
          <button
            onClick={() => setShowSubtasks({ ...showSubtasks, [goal.id]: !showSubtasks[goal.id] })}
            style={{
              background: 'none',
              border: 'none',
              color: '#6495ed',
              cursor: 'pointer',
              padding: '4px 0',
              marginTop: '8px',
              fontSize: '12px'
            }}
          >
            {showSubtasks[goal.id] ? 'Hide Subtasks' : 'Show Subtasks'}
          </button>
          {showSubtasks[goal.id] && (
            <div style={{ marginTop: '8px' }}>
              <SubTasks
                tasks={goal.tasks || []}
                onTasksChange={(tasks) => handleTasksChange(goal.id, tasks)}
                parentGoalId={goal.id}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Add this function to group goals by category
  const groupGoalsByCategory = (goals) => {
    const grouped = {};
    Object.keys(categoryGroups).forEach(group => {
      grouped[group] = goals.filter(goal => 
        categoryGroups[group].some(cat => cat.name === goal.category)
      );
    });
    return grouped;
  };

  // Add this function to render category groups
  const renderCategoryGroups = (goals) => {
    const groupedGoals = groupGoalsByCategory(goals);
    
    return Object.entries(groupedGoals).map(([group, groupGoals]) => (
      <div key={group} style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          color: '#333', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {group}
          <span style={{ 
            fontSize: '14px', 
            color: '#666',
            background: '#f5f5f5',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {groupGoals.length} goals
          </span>
        </h2>
        {viewMode === 'kanban' ? renderKanbanView(groupGoals) : renderListView(groupGoals)}
      </div>
    ));
  };

  // Update the renderKanbanView and renderListView functions to include new features
  const renderGoalCard = (goal) => (
    <div
      key={goal.id}
      draggable
      onDragStart={() => onDragStart(goal)}
      style={{
        background: '#fff',
        padding: '12px',
        marginBottom: '8px',
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'move',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: '0 0 8px 0' }}>{goal.title}</h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setShowNotes({ ...showNotes, [goal.id]: !showNotes[goal.id] })}
            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <FaComment color={showNotes[goal.id] ? '#6495ed' : '#666'} />
          </button>
          <button
            onClick={() => setShowDependencies({ ...showDependencies, [goal.id]: !showDependencies[goal.id] })}
            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <FaLink color={showDependencies[goal.id] ? '#6495ed' : '#666'} />
          </button>
          <button
            onClick={() => setSelectedGoal(goal)}
            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <FaShare color="#666" />
          </button>
        </div>
      </div>
      
      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
        {goal.description}
      </p>
      
      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '8px' }}>
        <span style={{ background: '#e6f0ff', padding: '2px 6px', borderRadius: '4px' }}>
          {goal.category}
        </span>
        <span style={{ background: '#d8bfd8', padding: '2px 6px', borderRadius: '4px' }}>
          {goal.priority}
        </span>
        <span style={{ background: '#6495ed', padding: '2px 6px', borderRadius: '4px' }}>
          {goal.timeframe}
        </span>
        {goal.completionDate && (
          <span style={{ 
            background: '#e6ffe6', 
            padding: '2px 6px', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FaCalendar size={12} />
            {new Date(goal.completionDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {renderProgressBar(goal.progress)}

      {/* Notes Section */}
      {showNotes[goal.id] && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
          <textarea
            value={goal.notes || ''}
            onChange={(e) => handleUpdateGoal({ ...goal, notes: e.target.value })}
            placeholder="Add notes..."
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Dependencies Section */}
      {showDependencies[goal.id] && (
        <div style={{ marginTop: '8px', padding: '8px', background: '#f8f9fa', borderRadius: '4px' }}>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleUpdateGoal({
                  ...goal,
                  dependencies: [...(goal.dependencies || []), e.target.value]
                });
              }
            }}
            style={{
              width: '100%',
              padding: '4px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Add dependency...</option>
            {goals
              .filter(g => g.id !== goal.id && !(goal.dependencies || []).includes(g.id))
              .map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
          </select>
          {(goal.dependencies || []).map(depId => {
            const depGoal = goals.find(g => g.id === depId);
            return depGoal ? (
              <div key={depId} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
                padding: '4px',
                background: '#fff',
                borderRadius: '4px'
              }}>
                <span>{depGoal.title}</span>
                <button
                  onClick={() => handleUpdateGoal({
                    ...goal,
                    dependencies: goal.dependencies.filter(id => id !== depId)
                  })}
                  style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                >
                  <FaTimes />
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Subtasks Section */}
      <button
        onClick={() => setShowSubtasks({ ...showSubtasks, [goal.id]: !showSubtasks[goal.id] })}
        style={{
          background: 'none',
          border: 'none',
          color: '#6495ed',
          cursor: 'pointer',
          padding: '4px 0',
          marginTop: '8px',
          fontSize: '12px'
        }}
      >
        {showSubtasks[goal.id] ? 'Hide Subtasks' : 'Show Subtasks'}
      </button>
      {showSubtasks[goal.id] && (
        <div style={{ marginTop: '8px' }}>
          <SubTasks
            tasks={goal.tasks || []}
            onTasksChange={(tasks) => handleTasksChange(goal.id, tasks)}
            parentGoalId={goal.id}
          />
        </div>
      )}
    </div>
  );

  // Add sharing modal
  const renderSharingModal = () => (
    selectedGoal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          width: '400px',
          maxWidth: '90%'
        }}>
          <h3>Share Goal</h3>
          <p>Share "{selectedGoal.title}" with others</p>
          <div style={{ marginTop: '16px' }}>
            <input
              type="email"
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '8px'
              }}
            />
            <button
              onClick={() => {
                // Implement sharing logic here
                setSelectedGoal(null);
              }}
              style={{
                background: '#6495ed',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
    }}>
      {/* Search and View Controls */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              minWidth: '200px'
            }}
          />
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'kanban' ? '#6495ed' : '#f5f5f5',
                color: viewMode === 'kanban' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Kanban View
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? '#6495ed' : '#f5f5f5',
                color: viewMode === 'list' ? '#fff' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              List View
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={filters.timeframe}
              onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">All Timeframes</option>
              <option value="Short">Short</option>
              <option value="Mid">Mid</option>
              <option value="Long-Term">Long-Term</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">All Statuses</option>
              {initialStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="priority">Sort by Priority</option>
            <option value="timeframe">Sort by Timeframe</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      </div>

      {/* Add Goal Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleAddGoal(); }} style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24, background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px rgba(100,149,237,0.08)" }}>
        <input 
          name="title" 
          value={newGoal.title} 
          onChange={handleInput} 
          placeholder="Goal Title" 
          required 
          style={{ flex: 2, minWidth: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontFamily: "'PT Sans', sans-serif" }} 
        />
        <input 
          name="description" 
          value={newGoal.description} 
          onChange={handleInput} 
          placeholder="Description" 
          style={{ flex: 2, minWidth: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontFamily: "'PT Sans', sans-serif" }} 
        />
        <select 
          name="category" 
          value={newGoal.category} 
          onChange={handleInput} 
          required
          style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select 
          name="timeframe" 
          value={newGoal.timeframe} 
          onChange={handleInput} 
          style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="Short">Short</option>
          <option value="Mid">Mid</option>
          <option value="Long">Long</option>
        </select>
        <select 
          name="priority" 
          value={newGoal.priority} 
          onChange={handleInput} 
          style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <input
          type="date"
          name="completionDate"
          value={newGoal.completionDate || ''}
          onChange={handleInput}
          style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button 
          type="submit" 
          style={{ 
            background: "#6495ED", 
            color: "white", 
            border: "none", 
            borderRadius: 6, 
            padding: "8px 18px", 
            fontFamily: "'Poppins', sans-serif", 
            fontWeight: 600, 
            cursor: "pointer" 
          }}
        >
          Add Goal
        </button>
      </form>

      {/* View Content */}
      {renderCategoryGroups(filteredAndSortedGoals)}

      {/* Edit Modal */}
      {modalGoal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h2>Edit Goal</h2>
            <form onSubmit={handleEditGoal}>
              <input name="title" value={editForm.title} onChange={handleEditInput} required style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              <input name="description" value={editForm.description} onChange={handleEditInput} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              <select name="category" value={editForm.category} onChange={handleEditInput} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}>
                {allCategories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
              <select name="timeframe" value={editForm.timeframe} onChange={handleEditInput} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}>
                <option>Short</option>
                <option>Mid</option>
                <option>Long</option>
              </select>
              <select name="priority" value={editForm.priority} onChange={handleEditInput} style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" style={{ background: "#6495ED", color: "white", border: "none", borderRadius: 6, padding: "8px 18px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, cursor: "pointer" }}>Save</button>
                <button type="button" onClick={handleDeleteGoal} style={{ background: "#eee", color: "#d00", border: "none", borderRadius: 6, padding: "8px 18px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, cursor: "pointer" }}>Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sharing Modal */}
      {renderSharingModal()}
    </div>
  );
} 