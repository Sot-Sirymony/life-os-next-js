import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CategoryAnalytics({ categories = [], goals = [], tasks = [] }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, week, month, quarter, year
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log when component mounts
  useEffect(() => {
    console.log('CategoryAnalytics Component Mounted');
  }, []);

  useEffect(() => {
    if (categories && goals && tasks) {
      setIsLoading(false);
    }
  }, [categories, goals, tasks]);

  // Add debugging
  useEffect(() => {
    console.log('CategoryAnalytics Debug:', {
      categoriesCount: categories.length,
      goalsCount: goals.length,
      tasksCount: tasks.length,
      categories: categories.map(c => ({ id: c.id, name: c.name })),
      goals: goals.map(g => ({ id: g.id, categoryId: g.categoryId, status: g.status })),
      tasks: tasks.map(t => ({ id: t.id, goalId: t.goalId, status: t.status }))
    });
  }, [categories, goals, tasks]);

  const calculateCategoryStats = () => {
    return categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryTasks = tasks.filter(t => {
        return categoryGoals.some(g => g.id === t.goalId);
      });
      
      const completedGoals = categoryGoals.filter(g => g.status === 'Done').length;
      const completedTasks = categoryTasks.filter(t => t.status === 'Done').length;
      const totalTimeSpent = categoryTasks.reduce((total, task) => {
        return total + (parseInt(task.timeSpent) || 0);
      }, 0);
      
      const avgTaskDuration = categoryTasks.length > 0 
        ? Math.round(totalTimeSpent / categoryTasks.length)
        : 0;
      
      const avgGoalProgress = categoryGoals.length > 0 
        ? Math.round(categoryGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / categoryGoals.length)
        : 0;
      
      return {
        ...category,
        totalGoals: categoryGoals.length,
        completedGoals,
        goalCompletionRate: categoryGoals.length > 0 ? Math.round((completedGoals / categoryGoals.length) * 100) : 0,
        totalTasks: categoryTasks.length,
        completedTasks,
        taskCompletionRate: categoryTasks.length > 0 ? Math.round((completedTasks / categoryTasks.length) * 100) : 0,
        totalTimeSpent,
        avgTaskDuration,
        avgGoalProgress
      };
    }).filter(stat => stat.totalGoals > 0 || stat.totalTasks > 0); // Only show categories with data
  };

  const calculateProgressOverTime = () => {
    // Generate sample progress data over time (last 30 days)
    const progressData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Calculate completion rate for this date
      const dateGoals = goals.filter(g => {
        const goalDate = new Date(g.createdAt);
        return goalDate <= date;
      });
      
      const completedOnDate = goals.filter(g => {
        const completionDate = g.completionDate ? new Date(g.completionDate) : null;
        return completionDate && completionDate.toDateString() === date.toDateString();
      }).length;
      
      const completionRate = dateGoals.length > 0 ? Math.round((completedOnDate / dateGoals.length) * 100) : 0;
      
      progressData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        progress: completionRate
      });
    }
    
    return progressData;
  };

  const calculateTimeAnalysis = () => {
    const categoryTimeStats = categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryTasks = tasks.filter(t => {
        return categoryGoals.some(g => g.id === t.goalId);
      });
      
      const totalTimeSpent = categoryTasks.reduce((total, task) => {
        return total + (parseInt(task.timeSpent) || 0);
      }, 0);
      
      const avgTimePerTask = categoryTasks.length > 0 
        ? Math.round(totalTimeSpent / categoryTasks.length)
        : 0;
      
      const avgTimePerGoal = categoryGoals.length > 0 
        ? Math.round(totalTimeSpent / categoryGoals.length)
        : 0;
      
      return {
        ...category,
        totalTimeSpent,
        avgTimePerTask,
        avgTimePerGoal,
        taskCount: categoryTasks.length,
        goalCount: categoryGoals.length
      };
    });
    
    return categoryTimeStats;
  };

  const stats = calculateCategoryStats();
  const progressData = calculateProgressOverTime();
  const timeAnalysis = calculateTimeAnalysis();

  // Add validation for chart data
  const hasValidData = stats.length > 0 && progressData.length > 0 && timeAnalysis.length > 0;

  console.log('CategoryAnalytics Chart Data:', {
    statsLength: stats.length,
    progressDataLength: progressData.length,
    timeAnalysisLength: timeAnalysis.length,
    hasValidData,
    sampleStats: stats.slice(0, 2),
    sampleProgress: progressData.slice(0, 3)
  });

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'PT Sans', sans-serif"
          }
        }
      },
      tooltip: {
        font: {
          family: "'PT Sans', sans-serif"
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            family: "'PT Sans', sans-serif"
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: "'PT Sans', sans-serif"
          }
        }
      }
    }
  };

  // Chart data
  const goalCompletionData = {
    labels: stats.length > 0 ? stats.map(c => c.name) : ['No Data'],
    datasets: [{
      label: 'Goal Completion Rate (%)',
      data: stats.length > 0 ? stats.map(c => c.goalCompletionRate) : [0],
      backgroundColor: stats.length > 0 ? stats.map(c => c.color) : ['#ccc'],
      borderColor: stats.length > 0 ? stats.map(c => c.color) : ['#ccc'],
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const taskCompletionData = {
    labels: stats.length > 0 ? stats.map(c => c.name) : ['No Data'],
    datasets: [{
      label: 'Task Completion Rate (%)',
      data: stats.length > 0 ? stats.map(c => c.taskCompletionRate) : [0],
      backgroundColor: stats.length > 0 ? stats.map(c => c.color) : ['#ccc'],
      borderColor: stats.length > 0 ? stats.map(c => c.color) : ['#ccc'],
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const progressLineData = {
    labels: progressData.length > 0 ? progressData.map(d => d.date) : ['No Data'],
    datasets: [{
      label: 'Daily Completion Rate (%)',
      data: progressData.length > 0 ? progressData.map(d => d.progress) : [0],
      borderColor: '#6495ED',
      backgroundColor: 'rgba(100, 149, 237, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  };

  const timeSpentData = {
    labels: timeAnalysis.length > 0 ? timeAnalysis.map(c => c.name) : ['No Data'],
    datasets: [{
      label: 'Total Time Spent (hours)',
      data: timeAnalysis.length > 0 ? timeAnalysis.map(c => Math.round(c.totalTimeSpent / 60)) : [0],
      backgroundColor: timeAnalysis.length > 0 ? timeAnalysis.map(c => c.color) : ['#ccc'],
      borderColor: timeAnalysis.length > 0 ? timeAnalysis.map(c => c.color) : ['#ccc'],
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading category analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#F44336', fontFamily: "'PT Sans', sans-serif" }}>{error}</p>
      </div>
    );
  }

  // Check if there's data to analyze
  if (!categories || categories.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          No Categories Available
        </h3>
        <p style={{
          color: '#666',
          fontFamily: "'PT Sans', sans-serif",
          margin: '0 0 16px 0'
        }}>
          Create some categories and goals to see analytics here.
        </p>
        <button
          onClick={() => window.location.href = '/categories'}
          style={{
            background: '#6495ED',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontFamily: "'PT Sans', sans-serif",
            cursor: 'pointer'
          }}
        >
          Go to Categories
        </button>
      </div>
    );
  }

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
        Category Analytics
      </h2>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
      </div>

      {/* Overall Statistics */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Overall Performance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #6495ED'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6495ED',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {categories.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Categories</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #4CAF50'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎯</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4CAF50',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {goals.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Goals</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #FF9800'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📝</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF9800',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {tasks.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Tasks</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #9C27B0'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>⏱️</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#9C27B0',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {formatTime(tasks.reduce((total, task) => total + (parseInt(task.timeSpent) || 0), 0))}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Time Spent</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Performance Charts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Goal Completion Rate */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Goal Completion Rate by Category
            </h4>
            <div style={{ height: '300px' }}>
              {goalCompletionData.labels.length > 0 ? (
                <Bar data={goalCompletionData} options={barChartOptions} />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  No goal data available
                </div>
              )}
            </div>
          </div>

          {/* Task Completion Rate */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Task Completion Rate by Category
            </h4>
            <div style={{ height: '300px' }}>
              {taskCompletionData.labels.length > 0 ? (
                <Bar data={taskCompletionData} options={barChartOptions} />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  No task data available
                </div>
              )}
            </div>
          </div>

          {/* Progress Over Time */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Daily Completion Progress
            </h4>
            <div style={{ height: '300px' }}>
              {progressLineData.labels.length > 0 ? (
                <Line data={progressLineData} options={chartOptions} />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  No progress data available
                </div>
              )}
            </div>
          </div>

          {/* Time Spent */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Time Spent by Category
            </h4>
            <div style={{ height: '300px' }}>
              {timeSpentData.labels.length > 0 ? (
                <Bar data={timeSpentData} options={chartOptions} />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  No time data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Details */}
      <div>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Category Performance Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {stats.map((category) => (
            <div
              key={category.id}
              style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${category.color}30`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  fontSize: '20px',
                  background: category.color,
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {category.icon}
                </div>
                <h4 style={{
                  margin: 0,
                  fontSize: '16px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  {category.name}
                </h4>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#6495ED' }}>
                    {category.totalGoals}
                  </div>
                  <div style={{ color: '#666' }}>Total Goals</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {category.goalCompletionRate}%
                  </div>
                  <div style={{ color: '#666' }}>Goal Completion</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9800' }}>
                    {category.totalTasks}
                  </div>
                  <div style={{ color: '#666' }}>Total Tasks</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9C27B0' }}>
                    {category.taskCompletionRate}%
                  </div>
                  <div style={{ color: '#666' }}>Task Completion</div>
                </div>
              </div>
              
              <div style={{ marginTop: '12px', padding: '8px', background: '#fff', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  Time Analysis
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>Total: {formatTime(category.totalTimeSpent)}</span>
                  <span>Avg/Task: {formatTime(category.avgTaskDuration)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 