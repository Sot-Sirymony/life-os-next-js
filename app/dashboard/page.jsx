'use client';

import Sidebar from '../../components/Sidebar';
import LifeGoalsBoard from '../../components/Goals/LifeGoalsBoard';
import WeeklyPlanner from '../../components/Planner/WeeklyPlanner';
import AITaskFilter from '../../components/Progress/AITaskFilter';
import AITimeEstimator from '../../components/Goals/AITimeEstimator';
import RecentActivityFeed from '../../components/Dashboard/RecentActivityFeed';
import PerformanceInsights from '../../components/Dashboard/PerformanceInsights';
import AchievementHighlights from '../../components/Dashboard/AchievementHighlights';
import TimeTrackingSummary from '../../components/Dashboard/TimeTrackingSummary';
import { useState, useEffect } from 'react';

// Dashboard Widget Component
function DashboardWidget({ title, value, icon, color = '#6495ED' }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      border: `2px solid ${color}`,
      minWidth: '180px',
      flex: '1 1 200px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          {title}
        </h3>
      </div>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        color: color,
        fontFamily: "'Poppins', sans-serif"
      }}>
        {value}
      </div>
    </div>
  );
}

// Progress Summary Component
function ProgressSummary({ goals, tasks }) {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'Done').length;
  const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
  const notStartedGoals = goals.filter(g => g.status === 'Not Started').length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const aiOptimizedTasks = tasks.filter(t => t.aiIntegration).length;

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
        Progress Summary
      </h2>
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <DashboardWidget 
          title="Total Goals" 
          value={totalGoals} 
          icon="🎯" 
          color="#6495ED"
        />
        <DashboardWidget 
          title="Completed" 
          value={completedGoals} 
          icon="✅" 
          color="#4CAF50"
        />
        <DashboardWidget 
          title="In Progress" 
          value={inProgressGoals} 
          icon="🔄" 
          color="#D8BFD8"
        />
        <DashboardWidget 
          title="Not Started" 
          value={notStartedGoals} 
          icon="⏳" 
          color="#E6F0FF"
        />
        <DashboardWidget 
          title="Completion Rate" 
          value={`${completionRate}%`} 
          icon="📊" 
          color="#FF9800"
        />
        <DashboardWidget 
          title="AI-Optimized Tasks" 
          value={aiOptimizedTasks} 
          icon="🤖" 
          color="#9C27B0"
        />
      </div>
    </div>
  );
}

// Goal Categories Widget
function GoalCategoriesWidget({ goals }) {
  const categoryGroups = {
    Foundations: [
      'Self-Development & Learning', 'Health & Wellness', 
      'Financial Security', 'Personal Growth'
    ],
    'People & Impact': [
      'Relationships', 'Community Involvement', 
      'Social Connection', 'Family'
    ],
    'Achievement & Enjoyment': [
      'Career & Professional Growth', 'Hobbies & Recreation', 
      'Travel & Adventure', 'Creative Expression'
    ]
  };

  const getCategoryStats = () => {
    const stats = {};
    Object.keys(categoryGroups).forEach(group => {
      stats[group] = {
        total: 0,
        completed: 0,
        categories: {}
      };
      categoryGroups[group].forEach(categoryName => {
        const categoryGoals = goals.filter(g => g.category && g.category.name === categoryName);
        stats[group].total += categoryGoals.length;
        stats[group].completed += categoryGoals.filter(g => g.status === 'Done').length;
        stats[group].categories[categoryName] = categoryGoals.length;
      });
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

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
        Goal Categories
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {Object.entries(categoryStats).map(([group, stats]) => (
          <div key={group} style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #E6F0FF'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              color: '#6495ED',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {group}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
                <span>Total: {stats.total}</span>
                <span>Completed: {stats.completed}</span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: '#E6F0FF',
                borderRadius: '3px',
                marginTop: '8px'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: '#6495ED',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {Object.entries(stats.categories).map(([category, count]) => (
                <div key={category} style={{ marginBottom: '4px' }}>
                  {category}: {count}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Access Widget
function QuickAccessWidget({ onNavigate }) {
  const quickActions = [
    { name: 'Add Goal', icon: '🎯', path: '/goals', color: '#6495ED' },
    { name: 'Create Task', icon: '📝', path: '/tasks', color: '#4CAF50' },
    { name: 'View Progress', icon: '📊', path: '/progress', color: '#FF9800' },
    { name: 'Weekly Plan', icon: '📅', path: '/planner', color: '#9C27B0' }
  ];

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
        Quick Access
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        {quickActions.map((action) => (
          <button
            key={action.name}
            onClick={() => onNavigate(action.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: '#f8f9fa',
              border: `2px solid ${action.color}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              color: '#333'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = action.color;
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.color = '#333';
            }}
          >
            <span style={{ fontSize: '24px' }}>{action.icon}</span>
            <span>{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// AI Tools Section
function AIToolsSection() {
  const handleTimeEstimate = (time) => {
    console.log('AI estimated time:', time);
  };

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
        AI-Powered Tools
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <AITaskFilter />
        <AITimeEstimator onEstimate={handleTimeEstimate} />
      </div>
    </div>
  );
}

// Top Navigation
function TopNavigation({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
    { id: 'tasks', name: 'Tasks', icon: '📝' },
    { id: 'progress', name: 'Progress', icon: '📈' },
    { id: 'ai-tools', name: 'AI Tools', icon: '🤖' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    }}>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: activeSection === section.id ? '#6495ED' : '#f8f9fa',
            color: activeSection === section.id ? '#fff' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px',
            fontWeight: activeSection === section.id ? '600' : '400'
          }}
        >
          <span>{section.icon}</span>
          <span>{section.name}</span>
        </button>
      ))}
    </div>
  );
}

// Task Management Component for Dashboard
function TaskManagement({ tasks, goals, categories }) {
  const [filter, setFilter] = useState('all'); // all, completed, in-progress, not-started
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, status, title

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || 
      (filter === 'completed' && task.status === 'Done') ||
      (filter === 'in-progress' && task.status === 'In Progress') ||
      (filter === 'not-started' && task.status === 'Not Started');
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      case 'status':
        const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Done': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Not Started': return '#F44336';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

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

      {/* Quick Access Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '20px' 
      }}>
        <button
          onClick={() => window.location.href = '/tasks'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#6495ED',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: "'PT Sans', sans-serif",
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#5a7fd8';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#6495ED';
          }}
        >
          <span>📝</span>
          <span>Full Task Management</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #E6F0FF',
            borderRadius: '6px',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="not-started">Not Started</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #E6F0FF',
            borderRadius: '6px',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="status">Sort by Status</option>
          <option value="title">Sort by Title</option>
        </select>

        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #E6F0FF',
            borderRadius: '6px',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px',
            minWidth: '200px'
          }}
        />
      </div>

      {/* Task Stats */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <DashboardWidget 
          title="Total Tasks" 
          value={tasks.length} 
          icon="📝" 
          color="#6495ED"
        />
        <DashboardWidget 
          title="Completed" 
          value={tasks.filter(t => t.status === 'Done').length} 
          icon="✅" 
          color="#4CAF50"
        />
        <DashboardWidget 
          title="In Progress" 
          value={tasks.filter(t => t.status === 'In Progress').length} 
          icon="🔄" 
          color="#FF9800"
        />
        <DashboardWidget 
          title="Not Started" 
          value={tasks.filter(t => t.status === 'Not Started').length} 
          icon="⏳" 
          color="#F44336"
        />
      </div>

      {/* Task List */}
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {sortedTasks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p>No tasks found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {sortedTasks.map((task) => (
              <div key={task.id} style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '2px solid #E6F0FF',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {task.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: getStatusColor(task.status),
                      fontFamily: "'PT Sans', sans-serif"
                    }}>
                      {task.status}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#fff',
                      background: getPriorityColor(task.priority),
                      fontFamily: "'PT Sans', sans-serif"
                    }}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                {task.description && (
                  <p style={{
                    margin: '0 0 8px 0',
                    color: '#666',
                    fontSize: '14px',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {task.description}
                  </p>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  fontSize: '12px', 
                  color: '#999',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  <span>📅 Due: {formatDate(task.dueDate)}</span>
                  {task.timeSpent && <span>⏱️ Time: {task.timeSpent}h</span>}
                  {task.goal && <span>🎯 Goal: {task.goal.title}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real data from API
        const [goalsResponse, tasksResponse, categoriesResponse] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/tasks'),
          fetch('/api/categories')
        ]);

        if (!goalsResponse.ok || !tasksResponse.ok || !categoriesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const goalsData = await goalsResponse.json();
        const tasksData = await tasksResponse.json();
        const categoriesData = await categoriesResponse.json();

        setGoals(goalsData);
        setTasks(tasksData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigate = (section) => {
    window.location.href = section;
  };

  // Generate real activity data from goals and tasks
  const generateActivityData = () => {
    const activities = [];
    
    // Add goal activities
    goals.forEach(goal => {
      // Goal creation
      activities.push({
        type: 'goal_created',
        description: `Created goal: "${goal.title}"`,
        timestamp: goal.createdAt
      });
      
      // Goal completion
      if (goal.status === 'Done' && goal.completionDate) {
        activities.push({
          type: 'goal_completed',
          description: `Completed goal: "${goal.title}"`,
          timestamp: goal.completionDate
        });
      }
      
      // Goal updates (if updated recently)
      if (goal.updatedAt && goal.updatedAt !== goal.createdAt) {
        activities.push({
          type: 'goal_updated',
          description: `Updated goal: "${goal.title}"`,
          timestamp: goal.updatedAt
        });
      }
    });
    
    // Add task activities
    tasks.forEach(task => {
      // Task creation
      activities.push({
        type: 'task_created',
        description: `Created task: "${task.title}"`,
        timestamp: task.createdAt
      });
      
      // Task completion
      if (task.status === 'Done') {
        activities.push({
          type: 'task_completed',
          description: `Completed task: "${task.title}"`,
          timestamp: task.updatedAt
        });
      }
      
      // Task updates (if updated recently)
      if (task.updatedAt && task.updatedAt !== task.createdAt) {
        activities.push({
          type: 'task_updated',
          description: `Updated task: "${task.title}"`,
          timestamp: task.updatedAt
        });
      }
    });
    
    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const activityData = generateActivityData();

  // Debug logging for Progress tab
  console.log('Dashboard Progress Debug:', {
    totalGoals: goals.length,
    totalTasks: tasks.length,
    activityCount: activityData.length,
    recentActivities: activityData.slice(0, 5).map(a => ({
      type: a.type,
      description: a.description.substring(0, 50) + '...',
      timestamp: a.timestamp
    })),
    completedGoals: goals.filter(g => g.status === 'Done').length,
    completedTasks: tasks.filter(t => t.status === 'Done').length,
    aiTasks: tasks.filter(t => t.aiIntegration).length
  });

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <ProgressSummary goals={goals} tasks={tasks} />
            <GoalCategoriesWidget goals={goals} />
            <QuickAccessWidget onNavigate={handleNavigate} />
          </>
        );
      case 'goals':
        return <LifeGoalsBoard />;
      case 'tasks':
        return <TaskManagement tasks={tasks} goals={goals} categories={categories} />;
      case 'progress':
        return (
          <>
            <RecentActivityFeed activities={activityData} />
            <PerformanceInsights goals={goals} tasks={tasks} />
            <AchievementHighlights goals={goals} tasks={tasks} />
            <TimeTrackingSummary tasks={tasks} />
          </>
        );
      case 'ai-tools':
        return <AIToolsSection />;
      default:
        return <ProgressSummary goals={goals} tasks={tasks} />;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#E6F0FF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '24px', color: '#6495ED', marginBottom: '8px' }}>Loading Dashboard...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Fetching your goals and tasks</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#E6F0FF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '24px', color: '#F44336', marginBottom: '8px' }}>Error Loading Dashboard</div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#6495ED',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: "'PT Sans', sans-serif"
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      background: '#E6F0FF',
      minHeight: '100vh',
      fontFamily: "'PT Sans', sans-serif"
    }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ 
            margin: '0 0 8px 0',
            fontSize: '32px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Dashboard
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            Welcome back! Here's your life management overview and quick access to all features.
          </p>
        </div>
        
        <TopNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
        {renderActiveSection()}
      </main>
    </div>
  );
} 