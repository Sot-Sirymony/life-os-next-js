import React, { useState, useEffect } from 'react';
import { FaChartLine, FaClock, FaCheckCircle, FaRobot, FaExclamationTriangle } from 'react-icons/fa';
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

export default function TaskAnalytics({ tasks, goals, categories }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all'); // all, week, month, quarter, year
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tasks && goals && categories) {
      setIsLoading(false);
    }
  }, [tasks, goals, categories]);

  // Add error boundary for chart rendering
  const renderChart = (ChartComponent, data, options) => {
    try {
      // Check if data is valid
      if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            No data available
          </div>
        );
      }
      
      return <ChartComponent data={data} options={options} />;
    } catch (err) {
      console.error('Chart rendering error:', err);
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#F44336',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          Chart error
        </div>
      );
    }
  };

  const calculateTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const notStartedTasks = tasks.filter(t => t.status === 'Not Started').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate time statistics
    const totalTimeEstimated = tasks.reduce((total, task) => {
      return total + (parseInt(task.timeEstimate) || 0);
    }, 0);
    
    const totalTimeSpent = tasks.reduce((total, task) => {
      return total + (parseInt(task.timeSpent) || 0);
    }, 0);
    
    const avgTimeAccuracy = completedTasks > 0 
      ? Math.round((totalTimeSpent / totalTimeEstimated) * 100)
      : 0;
    
    // Calculate priority distribution
    const priorityStats = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate AI integration effectiveness
    const aiTasks = tasks.filter(t => t.aiIntegration);
    const aiCompletedTasks = aiTasks.filter(t => t.status === 'Done').length;
    const aiCompletionRate = aiTasks.length > 0 
      ? Math.round((aiCompletedTasks / aiTasks.length) * 100)
      : 0;
    
    // Calculate goal performance
    const goalStats = goals.map(goal => {
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      const goalCompletedTasks = goalTasks.filter(t => t.status === 'Done').length;
      const goalTimeSpent = goalTasks.reduce((total, task) => {
        return total + (parseInt(task.timeSpent) || 0);
      }, 0);
      
      return {
        ...goal,
        totalTasks: goalTasks.length,
        completedTasks: goalCompletedTasks,
        completionRate: goalTasks.length > 0 ? Math.round((goalCompletedTasks / goalTasks.length) * 100) : 0,
        totalTimeSpent: goalTimeSpent
      };
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      completionRate,
      totalTimeEstimated,
      totalTimeSpent,
      avgTimeAccuracy,
      priorityStats,
      aiTasks: aiTasks.length,
      aiCompletionRate,
      goalStats
    };
  };

  const calculateTimeAnalysis = () => {
    const timeData = tasks.map(task => {
      const estimated = parseInt(task.timeEstimate) || 0;
      const spent = parseInt(task.timeSpent) || 0;
      const accuracy = estimated > 0 ? Math.round((spent / estimated) * 100) : 0;
      
      return {
        taskId: task.id,
        taskTitle: task.title,
        estimated,
        spent,
        accuracy,
        status: task.status,
        goalId: task.goalId
      };
    });

    const overEstimated = timeData.filter(d => d.accuracy < 80);
    const underEstimated = timeData.filter(d => d.accuracy > 120);
    const accurate = timeData.filter(d => d.accuracy >= 80 && d.accuracy <= 120);

    return {
      timeData,
      overEstimated,
      underEstimated,
      accurate
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
      
      const tasksOnDate = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate <= date;
      });
      
      const completedOnDate = tasksOnDate.filter(task => {
        if (task.status === 'Done' && task.completedAt) {
          const completionDate = new Date(task.completedAt);
          return completionDate <= date;
        }
        return false;
      });
      
      const progress = tasksOnDate.length > 0 
        ? Math.round((completedOnDate.length / tasksOnDate.length) * 100)
        : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        totalTasks: tasksOnDate.length,
        completedTasks: completedOnDate.length,
        progress
      });
    }
    
    return data;
  };

  const calculateCategoryTaskAnalytics = () => {
    return categories.map(category => {
      const categoryGoals = goals.filter(g => g.categoryId === category.id);
      const categoryTasks = tasks.filter(t => {
        return categoryGoals.some(g => g.id === t.goalId);
      });
      
      const completedTasks = categoryTasks.filter(t => t.status === 'Done').length;
      const totalTimeSpent = categoryTasks.reduce((total, task) => {
        return total + (parseInt(task.timeSpent) || 0);
      }, 0);
      
      const avgTaskDuration = categoryTasks.length > 0 
        ? Math.round(totalTimeSpent / categoryTasks.length)
        : 0;
      
      return {
        ...category,
        totalTasks: categoryTasks.length,
        completedTasks,
        completionRate: categoryTasks.length > 0 ? Math.round((completedTasks / categoryTasks.length) * 100) : 0,
        totalTimeSpent,
        avgTaskDuration
      };
    });
  };

  const stats = calculateTaskStats();
  const timeAnalysis = calculateTimeAnalysis();
  const progressData = calculateProgressOverTime();
  const categoryAnalytics = calculateCategoryTaskAnalytics();

  // Debug logging
  console.log('TaskAnalytics Debug:', {
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks,
    inProgressTasks: stats.inProgressTasks,
    notStartedTasks: stats.notStartedTasks,
    completionRate: stats.completionRate,
    totalTimeSpent: stats.totalTimeSpent,
    priorityStats: stats.priorityStats,
    aiTasks: stats.aiTasks,
    aiCompletionRate: stats.aiCompletionRate,
    goalStats: stats.goalStats.length,
    categoryAnalytics: categoryAnalytics.length,
    progressDataPoints: progressData.length
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
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
  const taskStatusChartData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [
        stats.completedTasks || 0, 
        stats.inProgressTasks || 0, 
        stats.notStartedTasks || 0
      ],
      backgroundColor: ['#4CAF50', '#FF9800', '#F44336'],
      borderColor: ['#4CAF50', '#FF9800', '#F44336'],
      borderWidth: 2,
    }]
  };

  const taskPriorityChartData = {
    labels: Object.keys(stats.priorityStats).length > 0 ? Object.keys(stats.priorityStats) : ['No Priority Data'],
    datasets: [{
      data: Object.keys(stats.priorityStats).length > 0 ? Object.values(stats.priorityStats) : [1],
      backgroundColor: Object.keys(stats.priorityStats).length > 0 ? Object.keys(stats.priorityStats).map(getPriorityColor) : ['#666'],
      borderColor: Object.keys(stats.priorityStats).length > 0 ? Object.keys(stats.priorityStats).map(getPriorityColor) : ['#666'],
      borderWidth: 2,
    }]
  };

  const timeAccuracyChartData = {
    labels: ['Over Estimated', 'Accurate', 'Under Estimated'],
    datasets: [{
      data: [
        timeAnalysis.overEstimated.length || 0, 
        timeAnalysis.accurate.length || 0, 
        timeAnalysis.underEstimated.length || 0
      ],
      backgroundColor: ['#F44336', '#4CAF50', '#FF9800'],
      borderColor: ['#F44336', '#4CAF50', '#FF9800'],
      borderWidth: 2,
    }]
  };

  const progressLineData = {
    labels: progressData.length > 0 ? progressData.map(d => d.date) : ['No Data'],
    datasets: [{
      label: 'Task Completion Rate (%)',
      data: progressData.length > 0 ? progressData.map(d => d.progress) : [0],
      borderColor: '#6495ED',
      backgroundColor: 'rgba(100, 149, 237, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const goalTaskBarData = {
    labels: stats.goalStats
      .filter(goal => goal.totalTasks > 0)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 10)
      .map(goal => goal.title.length > 20 ? goal.title.substring(0, 20) + '...' : goal.title),
    datasets: [{
      label: 'Task Completion Rate (%)',
      data: stats.goalStats
        .filter(goal => goal.totalTasks > 0)
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 10)
        .map(goal => goal.completionRate),
      backgroundColor: '#6495ED',
      borderColor: '#6495ED',
      borderWidth: 2,
      borderRadius: 4,
    }]
  };

  const categoryTaskBarData = {
    labels: categoryAnalytics
      .filter(category => category.totalTasks > 0)
      .map(category => category.name),
    datasets: [{
      label: 'Task Completion Rate (%)',
      data: categoryAnalytics
        .filter(category => category.totalTasks > 0)
        .map(category => category.completionRate),
      backgroundColor: categoryAnalytics
        .filter(category => category.totalTasks > 0)
        .map(category => category.color),
      borderColor: categoryAnalytics
        .filter(category => category.totalTasks > 0)
        .map(category => category.color),
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
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading task analytics...</p>
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

  // Check if there are any tasks to analyze
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '24px', 
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Task Analytics
        </h2>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif", marginBottom: '16px' }}>
          No tasks available for analysis
        </p>
        <p style={{ color: '#999', fontFamily: "'PT Sans', sans-serif", fontSize: '14px' }}>
          Create some tasks to see detailed analytics and insights
        </p>
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
        Task Analytics
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
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            fontSize: '14px'
          }}
        >
          <option value="all">All Goals</option>
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
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
            border: '2px solid #9C27B0'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#9C27B0',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.avgTimeAccuracy}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Time Accuracy</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #E91E63'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🤖</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#E91E63',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.aiTasks}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>AI Tasks</div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            border: '2px solid #FF9800'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚡</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#FF9800',
              fontFamily: "'Poppins', sans-serif"
            }}>
              {stats.aiTasks > 0 ? Math.round((stats.aiCompletionRate - stats.completionRate)) : 0}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Performance Boost</div>
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
            Task Completion Over Time
          </h4>
          <div style={{ height: '300px', background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            {renderChart(Line, progressLineData, lineChartOptions)}
          </div>
        </div>

        {/* Distribution Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Task Status Distribution */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Task Status Distribution
            </h4>
            <div style={{ height: '250px' }}>
              {renderChart(Doughnut, taskStatusChartData, chartOptions)}
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
              {renderChart(Pie, taskPriorityChartData, chartOptions)}
            </div>
          </div>

          {/* Time Accuracy Distribution */}
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Time Estimation Accuracy
            </h4>
            <div style={{ height: '250px' }}>
              {renderChart(Pie, timeAccuracyChartData, chartOptions)}
            </div>
          </div>
        </div>

        {/* Goal Task Performance Chart */}
        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '32px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Goal Task Performance (Top 10)
          </h4>
          <div style={{ height: '300px' }}>
            {renderChart(Bar, goalTaskBarData, barChartOptions)}
          </div>
        </div>

        {/* Category Task Performance Chart */}
        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '16px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Category Task Performance
          </h4>
          <div style={{ height: '300px' }}>
            {renderChart(Bar, categoryTaskBarData, barChartOptions)}
          </div>
        </div>
      </div>

      {/* Goal Performance Details */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Goal Task Performance Details
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.goalStats
            .filter(goal => goal.totalTasks > 0)
            .sort((a, b) => b.completionRate - a.completionRate)
            .slice(0, 10)
            .map((goal) => (
            <div
              key={goal.id}
              style={{
                background: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid #E6F0FF`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  fontSize: '20px',
                  background: '#6495ED',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  🎯
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '16px',
                    color: '#333',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600
                  }}>
                    {goal.title}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
                    <span>{goal.totalTasks} tasks</span>
                    <span>{goal.completionRate}% completion</span>
                    <span>{formatTime(goal.totalTimeSpent)} spent</span>
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
                  width: `${goal.completionRate}%`,
                  height: '100%',
                  background: '#6495ED',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>Completed: {goal.completedTasks}/{goal.totalTasks}</span>
                <span>Progress: {goal.completionRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Task Analytics */}
      <div>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Category Task Analytics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {categoryAnalytics
            .filter(category => category.totalTasks > 0)
            .map((category) => (
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
                    {category.completionRate}%
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