import Sidebar from '../../components/Sidebar';
import LifeGoalsBoard from '../../components/Goals/LifeGoalsBoard';
import WeeklyPlanner from '../../components/Planner/WeeklyPlanner';
import AITaskFilter from '../../components/Progress/AITaskFilter';
import AITimeEstimator from '../../components/Goals/AITimeEstimator';
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
      minWidth: '200px'
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
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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
      categoryGroups[group].forEach(category => {
        const categoryGoals = goals.filter(g => g.category === category);
        stats[group].total += categoryGoals.length;
        stats[group].completed += categoryGoals.filter(g => g.status === 'Done').length;
        stats[group].categories[category] = categoryGoals.length;
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
                marginTop: '4px'
              }}>
                <div style={{
                  width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%',
                  height: '100%',
                  background: '#6495ED',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(stats.categories).map(([category, count]) => (
                <span key={category} style={{
                  background: count > 0 ? '#6495ED' : '#E6F0FF',
                  color: count > 0 ? '#fff' : '#666',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  {category}: {count}
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
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[
          { label: 'Add New Goal', icon: '➕', action: () => onNavigate('goals') },
          { label: 'Weekly Planner', icon: '📅', action: () => onNavigate('planner') },
          { label: 'AI Tasks', icon: '🤖', action: () => onNavigate('ai-tasks') },
          { label: 'AI Tools', icon: '⚙️', action: () => onNavigate('ai-tools') },
          { label: 'Progress Tracking', icon: '📊', action: () => onNavigate('progress') },
          { label: 'Categories', icon: '📂', action: () => window.location.href = '/categories' },
          { label: 'Settings', icon: '⚙️', action: () => window.location.href = '/settings' }
        ].map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: '#E6F0FF',
              border: '1px solid #6495ED',
              borderRadius: '8px',
              color: '#333',
              cursor: 'pointer',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#6495ED';
              e.target.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#E6F0FF';
              e.target.style.color = '#333';
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// AI Tools Section
function AIToolsSection() {
  const [estimatedTime, setEstimatedTime] = useState(null);

  const handleTimeEstimate = (time) => {
    setEstimatedTime(time);
    // You can integrate this with task creation
    console.log('Estimated time applied:', time);
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
        AI Tools
      </h2>
      <div style={{ display: 'grid', gap: '24px' }}>
        <AITimeEstimator onTimeEstimate={handleTimeEstimate} />
      </div>
    </div>
  );
}

// Top Navigation Bar
function TopNavigation({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'goals', label: 'Life Goals', icon: '🎯' },
    { id: 'planner', label: 'Weekly Planner', icon: '📅' },
    { id: 'ai-tasks', label: 'AI Tasks', icon: '🤖' },
    { id: 'ai-tools', label: 'AI Tools', icon: '⚙️' },
    { id: 'progress', label: 'Progress', icon: '📈' }
  ];

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: activeSection === section.id ? '#6495ED' : '#E6F0FF',
              color: activeSection === section.id ? '#fff' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '14px',
              fontWeight: activeSection === section.id ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    // Fetch goals and tasks for the dashboard
    const fetchData = async () => {
      try {
        const [goalsResponse, tasksResponse] = await Promise.all([
          fetch('/api/goals'),
          fetch('/api/tasks')
        ]);
        
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);
        }
        
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'goals':
        return <LifeGoalsBoard />;
      case 'planner':
        return <WeeklyPlanner tasks={tasks} onTasksChange={setTasks} />;
      case 'ai-tasks':
        return <AITaskFilter tasks={tasks} />;
      case 'ai-tools':
        return <AIToolsSection />;
      case 'progress':
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            <ProgressSummary goals={goals} tasks={tasks} />
            <GoalCategoriesWidget goals={goals} />
          </div>
        );
      default:
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            <ProgressSummary goals={goals} tasks={tasks} />
            <GoalCategoriesWidget goals={goals} />
            <QuickAccessWidget onNavigate={handleNavigate} />
          </div>
        );
    }
  };

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
            Master Dashboard
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            Welcome to your Life OS dashboard. Track your progress and manage your goals.
          </p>
        </div>

        {/* Top Navigation */}
        <TopNavigation activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Active Section Content */}
        {renderActiveSection()}
      </main>
    </div>
  );
} 