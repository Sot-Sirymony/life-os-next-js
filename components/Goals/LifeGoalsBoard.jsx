import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaLink, FaComment, FaShare, FaCalendar } from "react-icons/fa";
import SubTasks from "./SubTasks";
import GoalDetailView from "./GoalDetailView";
import GoalManagement from "./GoalManagement";
import GoalAnalytics from "./GoalAnalytics";
import TaskManagement from "./TaskManagement";
import TaskAnalytics from "./TaskAnalytics";

// Mock API for goals - replace with actual API calls
const goalsApi = {
  getAll: async () => {
    const response = await fetch('/api/goals');
    return response.json();
  },
  create: async (goal) => {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return response.json();
  },
  update: async (id, goal) => {
    const response = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...goal }),
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch('/api/goals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return response.json();
  },
};

// Mock categories API
const categoriesApi = {
  getAll: async () => {
    const response = await fetch('/api/categories');
    return response.json();
  },
};

const initialStatuses = ["Not Started", "In Progress", "Done"];

function getStatusColor(status) {
  if (status === "Not Started") return "#E6F0FF";
  if (status === "In Progress") return "#D8BFD8";
  if (status === "Done") return "#6495ED";
  return "#eee";
}

export default function LifeGoalsBoard() {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    categoryId: "",
    status: "Not Started",
    progress: 0,
    timeframe: "Short",
    priority: "Medium",
    notes: "",
    dependencies: "[]",
    completionDate: null
  });
  const [draggedGoal, setDraggedGoal] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [modalGoal, setModalGoal] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [activeTab, setActiveTab] = useState('board'); // 'board', 'detail', 'management', 'analytics'
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

  // Fetch goals and categories on component mount
  useEffect(() => {
    fetchGoals();
    fetchCategories();
    fetchTasks();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
      // Set default category if available
      if (data.length > 0 && !newGoal.categoryId) {
        setNewGoal(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleAddGoal = async () => {
    try {
      if (!newGoal.title || !newGoal.categoryId) {
        console.error("Title and category are required");
        return;
      }

      const goalData = {
        ...newGoal,
        progress: newGoal.progress !== undefined ? parseInt(newGoal.progress) || 0 : 0
      };

      const createdGoal = await goalsApi.create(goalData);
      setGoals([...goals, createdGoal]);
      setIsAddingGoal(false);
      setNewGoal({
        title: "",
        description: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        status: "Not Started",
        progress: 0,
        timeframe: "Short",
        priority: "Medium",
        notes: "",
        dependencies: "[]",
        completionDate: null
      });
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const handleUpdateGoal = async (goal) => {
    try {
      // Only send the fields that can be updated, not the entire goal object with relations
      const updateData = {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        categoryId: goal.categoryId,
        status: goal.status,
        progress: goal.progress !== undefined ? parseInt(goal.progress) || 0 : 0,
        timeframe: goal.timeframe,
        priority: goal.priority,
        notes: goal.notes,
        dependencies: goal.dependencies,
        completionDate: goal.completionDate
      };

      const updatedGoal = await goalsApi.update(goal.id, updateData);
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      setIsEditingGoal(false);
      setCurrentGoal(null);
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsApi.delete(id);
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleTasksChange = async (goalId, tasks) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const updateData = {
          ...goal,
          tasks,
          progress: goal.progress !== undefined ? parseInt(goal.progress) || 0 : 0
        };
        const updatedGoal = await goalsApi.update(goalId, updateData);
        setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
      }
    } catch (error) {
      console.error("Failed to update tasks:", error);
    }
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setActiveTab('detail');
  };

  const handleGoalsChange = (newGoals) => {
    setGoals(newGoals);
  };

  function handleInput(e) {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  }

  function onDragStart(goal) {
    setDraggedGoal(goal);
  }

  function onDragOver(e, status) {
    e.preventDefault();
    setDragOverStatus(status);
  }

  function onDrop(status) {
    if (draggedGoal) {
      const updatedGoal = { ...draggedGoal, status };
      handleUpdateGoal(updatedGoal);
      setDraggedGoal(null);
    }
    setDragOverStatus(null);
  }

  function onDragEnd() {
    setDraggedGoal(null);
    setDragOverStatus(null);
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
    handleUpdateGoal(editForm);
    closeModal();
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#6495ED';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '🎯';
  };

  const renderProgressBar = (progress) => (
    <div style={{
      width: '100%',
      height: '6px',
      backgroundColor: '#E6F0FF',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '8px'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: '#6495ED',
        borderRadius: '3px',
        transition: 'width 0.3s ease'
      }} />
    </div>
  );

  const renderTabNavigation = () => (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      marginBottom: '24px',
      borderBottom: '2px solid #E6F0FF',
      paddingBottom: '8px'
    }}>
      {[
        { id: 'board', label: 'Goals Board', icon: '📋' },
        { id: 'management', label: 'Goal Management', icon: '⚙️' },
        { id: 'task-management', label: 'Task Management', icon: '📝' },
        { id: 'analytics', label: 'Goal Analytics', icon: '📈' },
        { id: 'task-analytics', label: 'Task Analytics', icon: '📊' }
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
  );

  const renderKanbanView = () => {
    // Apply filters to goals
    let filteredGoals = goals;
    
    if (filters.category !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.categoryId === filters.category);
    }
    if (filters.priority !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.priority === filters.priority);
    }
    if (filters.timeframe !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.timeframe === filters.timeframe);
    }
    if (filters.status !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.status === filters.status);
    }
    if (searchQuery) {
      filteredGoals = filteredGoals.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return (
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 0' }}>
        {initialStatuses.map((status) => (
          <div
            key={status}
            style={{
              minWidth: '300px',
              background: dragOverStatus === status ? '#E6F0FF' : '#f8f9fa',
              borderRadius: '12px',
              padding: '16px',
              border: `2px solid ${dragOverStatus === status ? '#6495ED' : getStatusColor(status)}`,
              transition: 'all 0.2s ease'
            }}
            onDragOver={(e) => onDragOver(e, status)}
            onDrop={(e) => onDrop(status)}
          >
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              textAlign: 'center'
            }}>
              {status}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredGoals
                .filter(goal => goal.status === status)
                .map((goal) => (
                  <div
                    key={goal.id}
                    draggable
                    onDragStart={() => onDragStart(goal)}
                    onDragEnd={onDragEnd}
                    onClick={(e) => {
                      // Only trigger click if not dragging
                      if (!draggedGoal) {
                        handleGoalClick(goal);
                      }
                    }}
                    style={{
                      background: '#fff',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: draggedGoal?.id === goal.id ? 'grabbing' : 'grab',
                      border: `2px solid ${draggedGoal?.id === goal.id ? '#6495ED' : '#E6F0FF'}`,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      userSelect: 'none',
                      opacity: draggedGoal?.id === goal.id ? 0.5 : 1,
                      transform: draggedGoal?.id === goal.id ? 'rotate(5deg)' : 'none'
                    }}
                    onMouseOver={(e) => {
                      if (!draggedGoal) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 16px rgba(100,149,237,0.15)';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        fontSize: '20px',
                        background: getCategoryColor(goal.categoryId),
                        color: '#fff',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getCategoryIcon(goal.categoryId)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          color: '#333',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 600
                        }}>
                          {goal.title}
                        </h4>
                        {goal.description && (
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: '#666',
                            fontFamily: "'PT Sans', sans-serif"
                          }}>
                            {goal.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            background: goal.priority === 'High' ? '#F44336' : goal.priority === 'Medium' ? '#FF9800' : '#4CAF50',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 600
                          }}>
                            {goal.priority}
                          </span>
                          <span style={{
                            background: goal.timeframe === 'Short' ? '#4CAF50' : goal.timeframe === 'Medium' ? '#FF9800' : '#6495ED',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 600
                          }}>
                            {goal.timeframe}
                          </span>
                        </div>
                        {renderProgressBar(goal.progress)}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            Progress: {goal.progress}%
                          </span>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {getCategoryName(goal.categoryId)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    // Apply filters to goals
    let filteredGoals = goals;
    
    if (filters.category !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.categoryId === filters.category);
    }
    if (filters.priority !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.priority === filters.priority);
    }
    if (filters.timeframe !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.timeframe === filters.timeframe);
    }
    if (filters.status !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.status === filters.status);
    }
    if (searchQuery) {
      filteredGoals = filteredGoals.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => handleGoalClick(goal)}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              border: '2px solid #E6F0FF',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px rgba(100,149,237,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                fontSize: '24px',
                background: getCategoryColor(goal.categoryId),
                color: '#fff',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getCategoryIcon(goal.categoryId)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {goal.title}
                  </h3>
                  <span style={{
                    background: goal.status === 'Done' ? '#4CAF50' : goal.status === 'In Progress' ? '#FF9800' : '#666',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {goal.status}
                  </span>
                </div>
                {goal.description && (
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {goal.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#666' }}>
                  <span>Category: {getCategoryName(goal.categoryId)}</span>
                  <span>Priority: {goal.priority}</span>
                  <span>Timeframe: {goal.timeframe}</span>
                  <span>Progress: {goal.progress}%</span>
                </div>
                {renderProgressBar(goal.progress)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const groupGoalsByCategory = (goals) => {
    const groups = {};
    goals.forEach(goal => {
      const categoryName = getCategoryName(goal.categoryId);
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(goal);
    });
    return groups;
  };

  const renderCategoryGroups = (goals) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Object.entries(groupGoalsByCategory(goals)).map(([categoryName, categoryGoals]) => (
        <div key={categoryName}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            {categoryName}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {categoryGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  border: '2px solid #E6F0FF',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 16px rgba(100,149,237,0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    fontSize: '20px',
                    background: getCategoryColor(goal.categoryId),
                    color: '#fff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getCategoryIcon(goal.categoryId)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      color: '#333',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600
                    }}>
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#666',
                        fontFamily: "'PT Sans', sans-serif"
                      }}>
                        {goal.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        background: goal.priority === 'High' ? '#F44336' : goal.priority === 'Medium' ? '#FF9800' : '#4CAF50',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        {goal.priority}
                      </span>
                      <span style={{
                        background: goal.status === 'Done' ? '#4CAF50' : goal.status === 'In Progress' ? '#FF9800' : '#666',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 600
                      }}>
                        {goal.status}
                      </span>
                    </div>
                    {renderProgressBar(goal.progress)}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Progress: {goal.progress}%
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {goal.timeframe}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderGoalCard = (goal) => (
    <div
      key={goal.id}
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '16px',
        border: '2px solid #E6F0FF',
        marginBottom: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          fontSize: '20px',
          background: getCategoryColor(goal.categoryId),
          color: '#fff',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {getCategoryIcon(goal.categoryId)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {goal.title}
            </h4>
            <span style={{
              background: goal.status === 'Done' ? '#4CAF50' : goal.status === 'In Progress' ? '#FF9800' : '#666',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 600
            }}>
              {goal.status}
            </span>
          </div>
          {goal.description && (
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#666',
              fontFamily: "'PT Sans', sans-serif"
            }}>
              {goal.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: goal.priority === 'High' ? '#F44336' : goal.priority === 'Medium' ? '#FF9800' : '#4CAF50',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 600
            }}>
              {goal.priority}
            </span>
            <span style={{
              background: goal.timeframe === 'Short' ? '#4CAF50' : goal.timeframe === 'Medium' ? '#FF9800' : '#6495ED',
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 600
            }}>
              {goal.timeframe}
            </span>
          </div>
          {renderProgressBar(goal.progress)}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Progress: {goal.progress}%
            </span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {getCategoryName(goal.categoryId)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSharingModal = () => (
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
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
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
          Share Goal
        </h3>
        <p style={{
          margin: '0 0 16px 0',
          color: '#666',
          fontSize: '14px'
        }}>
          Share this goal with others or export it for backup.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => {/* Handle share */}}
            style={{
              background: '#6495ED',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontFamily: "'PT Sans', sans-serif",
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Share
          </button>
          <button
            onClick={() => {/* Handle export */}}
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontFamily: "'PT Sans', sans-serif",
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Export
          </button>
          <button
            onClick={() => {/* Close modal */}}
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
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: '#6495ED', margin: 0 }}>Life Goals</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            style={{
              background: '#E6F0FF',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontFamily: "'PT Sans', sans-serif",
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
          </button>
          <button
            onClick={() => setIsAddingGoal(true)}
            style={{
              background: '#6495ED',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Add Goal
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      {activeTab === 'board' && (
        <div>
          {/* View Mode Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
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
              value={filters.timeframe}
              onChange={(e) => setFilters({ ...filters, timeframe: e.target.value })}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif",
                fontSize: '14px'
              }}
            >
              <option value="all">All Timeframes</option>
              <option value="Short">Short-term</option>
              <option value="Medium">Medium-term</option>
              <option value="Long">Long-term</option>
            </select>

            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontFamily: "'PT Sans', sans-serif",
                fontSize: '14px',
                flex: 1
              }}
            />
          </div>

          {/* Goals Display */}
          {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
        </div>
      )}

      {activeTab === 'detail' && selectedGoal && (
        <GoalDetailView
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onEdit={(goal) => {
            setSelectedGoal(null);
            setActiveTab('management');
          }}
          onDelete={(goal) => {
            handleDeleteGoal(goal.id);
            setSelectedGoal(null);
          }}
          onUpdateProgress={(updatedGoal) => {
            handleUpdateGoal(updatedGoal);
            setSelectedGoal(updatedGoal);
          }}
        />
      )}

      {activeTab === 'management' && (
        <GoalManagement
          goals={goals}
          onGoalsChange={handleGoalsChange}
        />
      )}

      {activeTab === 'analytics' && (
        <GoalAnalytics
          goals={goals}
          categories={categories}
          tasks={tasks}
        />
      )}

      {activeTab === 'task-management' && (
        <TaskManagement
          tasks={tasks}
          goals={goals}
          onTasksChange={setTasks}
          onGoalsChange={setGoals}
        />
      )}

      {activeTab === 'task-analytics' && (
        <TaskAnalytics
          tasks={tasks}
          goals={goals}
          categories={categories}
        />
      )}

      {/* Add Goal Modal */}
      {isAddingGoal && (
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
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '90vw',
            boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <h3 style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: '#6495ED',
              marginBottom: '16px'
            }}>
              Add New Goal
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddGoal(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                name="title"
                value={newGoal.title}
                onChange={handleInput}
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
                name="description"
                value={newGoal.description}
                onChange={handleInput}
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
                  name="categoryId"
                  value={newGoal.categoryId}
                  onChange={handleInput}
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
                  name="timeframe"
                  value={newGoal.timeframe}
                  onChange={handleInput}
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
                  name="priority"
                  value={newGoal.priority}
                  onChange={handleInput}
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
                <input
                  type="number"
                  name="progress"
                  value={newGoal.progress}
                  onChange={handleInput}
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
                  Add Goal
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
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
    </div>
  );
} 