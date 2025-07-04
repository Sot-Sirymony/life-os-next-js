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

export default function GoalAnalytics({ goals, categories, tasks }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, week, month, quarter, year
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (goals && categories && tasks) {
      setIsLoading(false);
    }
  }, [goals, categories, tasks]);

  const calculateGoalStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'Done').length;
    const inProgressGoals = goals.filter(g => g.status === 'In Progress').length;
    const notStartedGoals = goals.filter(g => g.status === 'Not Started').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    // Calculate average progress
    const avgProgress = totalGoals > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
      : 0;
    
    // Calculate total time spent on goals
    const totalTimeSpent = tasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    // Calculate priority distribution
    const priorityStats = goals.reduce((acc, goal) => {
      acc[goal.priority] = (acc[goal.priority] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate timeframe distribution
    const timeframeStats = goals.reduce((acc, goal) => {
      acc[goal.timeframe] = (acc[goal.timeframe] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate category performance
    const categoryStats = categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryCompleted = categoryGoals.filter(g => g.status === 'Done').length;
      const categoryProgress = categoryGoals.length > 0 
        ? Math.round(categoryGoals.reduce((sum, g) => sum + g.progress, 0) / categoryGoals.length)
        : 0;
      
      return {
        ...category,
        totalGoals: categoryGoals.length,
        completedGoals: categoryCompleted,
        completionRate: categoryGoals.length > 0 ? Math.round((categoryCompleted / categoryGoals.length) * 100) : 0,
        avgProgress: categoryProgress
      };
    });

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      notStartedGoals,
      completionRate,
      avgProgress,
      totalTimeSpent,
      priorityStats,
      timeframeStats,
      categoryStats
    };
  };

  const calculateProgressOverTime = () => {
    const now = new Date();
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };
    
    const days = selectedTimeframe === 'all' ? 365 : timeframes[selectedTimeframe];
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const goalsOnDate = goals.filter(goal => {
        const goalDate = new Date(goal.createdAt);
        return goalDate <= date;
      });
      
      const completedOnDate = goalsOnDate.filter(goal => {
        if (goal.status === 'Done' && goal.completionDate) {
          const completionDate = new Date(goal.completionDate);
          return completionDate <= date;
        }
        return false;
      });
      
      const progress = goalsOnDate.length > 0 
        ? Math.round((completedOnDate.length / goalsOnDate.length) * 100)
        : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalGoals: goalsOnDate.length,
        completedGoals: completedOnDate.length,
        progress
      });
    }
    
    return data;
  };

  const calculateCategoryAnalytics = () => {
    return categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryTasks = tasks.filter(t => {
        const taskGoal = goals.find(g => g.id === t.goalId);
        return taskGoal && taskGoal.categoryId === category.id;
      });
      
      const totalTimeSpent = categoryTasks.reduce((total, task) => {
        return total + (parseInt(task.timeSpent) || 0);
      }, 0);
      
      const avgTaskDuration = categoryTasks.length > 0 
        ? Math.round(totalTimeSpent / categoryTasks.length)
        : 0;
      
      const taskCompletionRate = categoryTasks.length > 0 
        ? Math.round((categoryTasks.filter(t => t.status === 'Done').length / categoryTasks.length) * 100)
        : 0;
      
      return {
        ...category,
        totalTasks: categoryTasks.length,
        totalTimeSpent,
        avgTaskDuration,
        taskCompletionRate
      };
    });
  };

  const stats = calculateGoalStats();
  const progressData = calculateProgressOverTime();
  const categoryAnalytics = calculateCategoryAnalytics();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'Short': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Long': return '#6495ED';
      default: return '#666';
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Chart data configurations
  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [stats.completedGoals, stats.inProgressGoals, stats.notStartedGoals],
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      borderColor: ['#4CAF50', '#FF9800', '#F44336'],
      borderWidth: 2,
    }]
  };

  const priorityChartData = {
    labels: Object.keys(stats.priorityStats),
    datasets: [{
      data: Object.values(stats.priorityStats),
      backgroundColor: Object.keys(stats.priorityStats).map(getPriorityColor),
      borderColor: Object.keys(stats.priorityStats).map(getPriorityColor),
      borderWidth: 2,
    }]
  };

  const timeframeChartData = {
    labels: Object.keys(stats.timeframeStats),
    datasets: [{
      data: Object.values(stats.timeframeStats),
      backgroundColor: Object.keys(stats.timeframeStats).map(getTimeframeColor),
      borderColor: Object.keys(stats.timeframeStats).map(getTimeframeColor),
      borderWidth: 2,
    }]
  };

  const progressLineData = {
    labels: progressData.map(d => d.date),
    datasets: [{
      label: 'Completion Rate (%)',
      data: progressData.map(d => d.progress),
      borderColor: '#6495ED',
      backgroundColor: 'rgba(100, 149, 237, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const categoryBarData = {
    labels: stats.categoryStats.map(c => c.name),
    datasets: [{
      label: 'Completion Rate (%)',
      data: stats.categoryStats.map(c => c.completionRate),
      backgroundColor: stats.categoryStats.map(c => c.color),
      borderColor: stats.categoryStats.map(c => c.color),
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'PT Sans', sans-serif",
            size: 12
          },
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          family: "'Poppins', sans-serif",
          size: 14
        },
        bodyFont: {
          family: "'PT Sans', sans-serif",
          size: 12
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          font: {
            family: "'PT Sans', sans-serif",
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: "'PT Sans', sans-serif",
            size: 12
          },
          maxRotation: 45
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
            family: "'PT Sans', sans-serif",
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: "'PT Sans', sans-serif",
            size: 12
          },
          maxRotation: 45
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading analytics...</p>
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
        Goal Analytics
      </h2>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px'
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
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎯</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#6495ED',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.totalGoals}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Goals</div>
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
              {stats.completionRate}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Completion Rate</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #FF9800'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF9800',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.avgProgress}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Progress</div>
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
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#9C27B0',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {formatTime(stats.totalTimeSpent)}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Time Spent</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Visual Analytics
        </h3>
        
        {/* Progress Over Time Chart */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Progress Over Time
          </h4>
          <div style={{ height: '300px', background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <Line data={progressLineData} options={lineChartOptions} />
          </div>
        </div>

        {/* Distribution Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Goal Status Distribution */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Goal Status Distribution
            </h4>
            <div style={{ height: '250px' }}>
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Priority Distribution */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Priority Distribution
            </h4>
            <div style={{ height: '250px' }}>
              <Pie data={priorityChartData} options={chartOptions} />
            </div>
          </div>

          {/* Timeframe Distribution */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Timeframe Distribution
            </h4>
            <div style={{ height: '250px' }}>
              <Pie data={timeframeChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Category Performance Chart */}
        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Category Performance
          </h4>
          <div style={{ height: '300px' }}>
            <Bar data={categoryBarData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Category Performance Details */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Category Performance Details
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.categoryStats.map((category) => (
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
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {category.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                    <span>{category.totalGoals} goals</span>
                    <span>{category.completionRate}% completion</span>
                    <span>{category.avgProgress}% avg progress</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: '#E6F0FF',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${category.avgProgress}%`,
                  height: '100%',
                  background: category.color,
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>Completed: {category.completedGoals}/{category.totalGoals}</span>
                <span>Progress: {category.avgProgress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Analytics Integration */}
      <div>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Category Analytics Integration
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {categoryAnalytics.map((category) => (
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
                    {category.totalTasks}
                  </div>
                  <div style={{ color: '#666' }}>Total Tasks</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {category.taskCompletionRate}%
                  </div>
                  <div style={{ color: '#666' }}>Task Completion</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9800' }}>
                    {formatTime(category.totalTimeSpent)}
                  </div>
                  <div style={{ color: '#666' }}>Time Spent</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9C27B0' }}>
                    {formatTime(category.avgTaskDuration)}
                  </div>
                  <div style={{ color: '#666' }}>Avg Task Duration</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 