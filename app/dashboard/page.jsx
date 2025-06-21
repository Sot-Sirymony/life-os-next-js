'use client';

import ResponsiveLayout from '../../components/ResponsiveLayout';
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
      padding: 'clamp(16px, 4vw, 20px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      border: `2px solid ${color}`,
      minWidth: '140px',
      flex: '1 1 160px',
      maxWidth: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'clamp(18px, 4vw, 24px)' }}>{icon}</span>
        <h3 style={{ 
          margin: 0, 
          fontSize: 'clamp(12px, 3vw, 16px)', 
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          {title}
        </h3>
      </div>
      <div style={{ 
        fontSize: 'clamp(20px, 5vw, 32px)', 
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
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: 'clamp(18px, 4vw, 24px)', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        Progress Summary
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'clamp(12px, 3vw, 16px)',
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
  const categoryStats = goals.reduce((acc, goal) => {
    const group = goal.group || 'Personal';
    const category = goal.category?.name || 'General';
    
    if (!acc[group]) {
      acc[group] = { total: 0, completed: 0, categories: {} };
    }
    
    acc[group].total++;
    if (goal.status === 'Done') {
      acc[group].completed++;
    }
    
    if (!acc[group].categories[category]) {
      acc[group].categories[category] = 0;
    }
    acc[group].categories[category]++;
    
    return acc;
  }, {});

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: 'clamp(18px, 4vw, 24px)', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        Goal Categories
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 'clamp(16px, 3vw, 20px)' 
      }}>
        {Object.entries(categoryStats).map(([group, stats]) => (
          <div key={group} style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: 'clamp(12px, 3vw, 16px)',
            border: '2px solid #E6F0FF'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: '#6495ED',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {group}
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#666', flexWrap: 'wrap', gap: '4px' }}>
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
            <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: '#999' }}>
              {Object.entries(stats.categories).map(([cat, count]) => (
                <span key={cat} style={{ marginRight: '8px' }}>
                  {cat}: {count}
                </span>
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
    { label: 'Add Goal', icon: '🎯', action: () => onNavigate('/goals'), color: '#6495ED' },
    { label: 'Create Task', icon: '✅', action: () => onNavigate('/tasks'), color: '#4CAF50' },
    { label: 'Weekly Plan', icon: '📅', action: () => onNavigate('/planner'), color: '#FF9800' },
    { label: 'View Progress', icon: '📈', action: () => onNavigate('/progress'), color: '#9C27B0' }
  ];

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: 'clamp(18px, 4vw, 24px)', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        Quick Actions
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'clamp(12px, 3vw, 16px)'
      }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 12px)',
              padding: 'clamp(12px, 3vw, 16px)',
              background: '#f8f9fa',
              border: `2px solid ${action.color}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 500,
              color: '#333'
            }}
            onMouseOver={(e) => {
              e.target.style.background = action.color;
              e.target.style.color = '#fff';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.color = '#333';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 'clamp(18px, 4vw, 24px)' }}>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// AI Tools Section
function AIToolsSection() {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: 'clamp(18px, 4vw, 24px)', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        AI-Powered Tools
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'clamp(16px, 3vw, 20px)'
      }}>
        <AITaskFilter />
        <AITimeEstimator />
      </div>
    </div>
  );
}

// Top Navigation Component
function TopNavigation({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'ai-tools', label: 'AI Tools', icon: '🤖' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: 'clamp(4px, 1vw, 8px)',
      marginBottom: 'clamp(16px, 4vw, 24px)',
      overflowX: 'auto',
      paddingBottom: '8px'
    }}>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionChange(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(4px, 1vw, 8px)',
            padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
            background: activeSection === section.id ? '#6495ED' : 'transparent',
            color: activeSection === section.id ? '#fff' : '#333',
            border: `2px solid ${activeSection === section.id ? '#6495ED' : '#E6F0FF'}`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: activeSection === section.id ? 600 : 400,
            whiteSpace: 'nowrap',
            minWidth: 'fit-content'
          }}
        >
          <span style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>{section.icon}</span>
          <span>{section.label}</span>
        </button>
      ))}
    </div>
  );
}

// Task Management Component
function TaskManagement({ tasks, goals, categories }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#4CAF50';
      case 'In Progress': return '#FF9800';
      case 'Pending': return '#6495ED';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: 'clamp(16px, 4vw, 24px)',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        fontSize: 'clamp(18px, 4vw, 24px)', 
        color: '#333',
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600
      }}>
        Task Management
      </h2>
      
      {tasks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(32px, 8vw, 48px) clamp(16px, 4vw, 24px)',
          color: '#666'
        }}>
          <div style={{ fontSize: 'clamp(48px, 12vw, 64px)', marginBottom: '16px' }}>📋</div>
          <p style={{ margin: '0 0 8px 0', fontSize: 'clamp(16px, 4vw, 18px)' }}>No tasks yet</p>
          <p style={{ margin: 0, fontSize: 'clamp(14px, 3vw, 16px)' }}>
            Create your first task to get started
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(16px, 3vw, 20px)'
        }}>
          {tasks.slice(0, 6).map((task) => (
            <div key={task.id} style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: 'clamp(12px, 3vw, 16px)',
              border: '2px solid #E6F0FF',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: 'clamp(14px, 3vw, 16px)',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  flex: 1
                }}>
                  {task.title}
                </h3>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    background: getStatusColor(task.status),
                    color: '#fff',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {task.status}
                  </span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                    background: getPriorityColor(task.priority),
                    color: '#fff',
                    fontFamily: "'PT Sans', sans-serif"
                  }}>
                    {task.priority}
                  </span>
                </div>
              </div>
              
              {task.description && (
                <p style={{
                  margin: '0 0 8px 0',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif",
                  lineHeight: 1.4
                }}>
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description
                  }
                </p>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                color: '#999',
                fontFamily: "'PT Sans', sans-serif",
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>Created: {formatDate(task.createdAt)}</span>
                {task.timeEstimate && (
                  <span>⏱️ {task.timeEstimate}min</span>
                )}
                {task.aiIntegration && (
                  <span style={{ color: '#9C27B0' }}>🤖 AI Optimized</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
  const activityData = [
    ...goals.map(goal => ({
      id: `goal-${goal.id}`,
      type: 'goal',
      description: `Goal "${goal.title}" ${goal.status === 'Done' ? 'completed' : 'updated'}`,
      timestamp: goal.updatedAt || goal.createdAt,
      icon: goal.status === 'Done' ? '🎯' : '📝'
    })),
    ...tasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task',
      description: `Task "${task.title}" ${task.status === 'Done' ? 'completed' : 'updated'}`,
      timestamp: task.updatedAt || task.createdAt,
      icon: task.status === 'Done' ? '✅' : '📋'
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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
      <ResponsiveLayout 
        title="Dashboard" 
        description="Welcome back! Here's your life management overview and quick access to all features."
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', color: '#6495ED', marginBottom: '8px' }}>Loading Dashboard...</div>
            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#666' }}>Fetching your goals and tasks</div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error) {
    return (
      <ResponsiveLayout 
        title="Dashboard" 
        description="Welcome back! Here's your life management overview and quick access to all features."
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', color: '#F44336', marginBottom: '8px' }}>Error Loading Dashboard</div>
            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#666', marginBottom: '16px' }}>{error}</div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
                background: '#6495ED',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: 'clamp(14px, 3vw, 16px)',
                fontFamily: "'PT Sans', sans-serif"
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout 
      title="Dashboard" 
      description="Welcome back! Here's your life management overview and quick access to all features."
    >
      <TopNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      {renderActiveSection()}
    </ResponsiveLayout>
  );
} 