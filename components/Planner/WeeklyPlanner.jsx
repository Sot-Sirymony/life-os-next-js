import React, { useState } from "react";
import { FaCalendarAlt, FaClock, FaList, FaCalendarWeek, FaPlus } from 'react-icons/fa';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlanner({ tasks = [], onTasksChange }) {
  const [view, setView] = useState('weekly'); // 'daily' or 'weekly'
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [draggedTask, setDraggedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    day: selectedDay,
    startTime: '09:00',
    endTime: '10:00',
    status: 'Not Started'
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const taskToAdd = {
        id: Date.now(),
        ...newTask,
        status: 'Not Started'
      };
      onTasksChange([...tasks, taskToAdd]);
      setNewTask({
        title: '',
        description: '',
        day: selectedDay,
        startTime: '09:00',
        endTime: '10:00',
        status: 'Not Started'
      });
      setIsAddingTask(false);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDrop = (day, hour) => {
    if (!draggedTask) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === draggedTask.id) {
        return {
          ...task,
          day,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
        };
      }
      return task;
    });

    onTasksChange(updatedTasks);
    setDraggedTask(null);
  };

  const getTasksForTimeSlot = (day, hour) => {
    return tasks.filter(task => {
      if (!task.startTime || typeof task.startTime !== 'string') return false;
      const taskStartHour = parseInt(task.startTime.split(':')[0]);
      return task.day === day && taskStartHour === hour;
    });
  };

  const renderTimeSlot = (day, hour) => {
    const tasksInSlot = getTasksForTimeSlot(day, hour);
    return (
      <div
        key={`${day}-${hour}`}
        className="time-slot"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(day, hour)}
        style={{
          position: 'relative',
          height: '60px',
          borderBottom: '1px solid #eee',
          padding: '4px',
          background: tasksInSlot.length > 0 ? '#E6F0FF' : 'white'
        }}
      >
        {tasksInSlot.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => handleDragStart(task)}
            style={{
              background: task.status === 'Done' ? '#6495ED' : 
                        task.status === 'In Progress' ? '#D8BFD8' : '#f8f9fa',
              color: task.status === 'Done' ? 'white' : '#333',
              padding: '4px 8px',
              borderRadius: '4px',
              marginBottom: '4px',
              fontSize: '12px',
              cursor: 'move'
            }}
          >
            {task.title}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '24px',
          color: '#333',
          margin: 0
        }}>
          Weekly Planner
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setView('daily')}
            style={{
              background: view === 'daily' ? '#6495ED' : '#f8f9fa',
              color: view === 'daily' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FaCalendarAlt /> Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            style={{
              background: view === 'weekly' ? '#6495ED' : '#f8f9fa',
              color: view === 'weekly' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FaCalendarWeek /> Weekly
          </button>
          <button
            onClick={() => setIsAddingTask(true)}
            style={{
              background: '#6495ED',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FaPlus /> Add Task
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: view === 'weekly' ? '100px repeat(7, 1fr)' : '100px 1fr',
        gap: '1px',
        background: '#eee',
        border: '1px solid #eee',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Time Column */}
        <div style={{ background: 'white' }}>
          <div style={{
            padding: '12px',
            background: '#f8f9fa',
            borderBottom: '1px solid #eee',
            textAlign: 'center',
            fontWeight: 500
          }}>
            Time
          </div>
          {HOURS.map(hour => (
            <div
              key={hour}
              style={{
                padding: '4px 12px',
                borderBottom: '1px solid #eee',
                fontSize: '12px',
                color: '#666'
              }}
            >
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        {view === 'weekly' ? (
          DAYS.map((day, index) => (
            <div key={day} style={{ background: 'white' }}>
              <div style={{
                padding: '12px',
                background: '#f8f9fa',
                borderBottom: '1px solid #eee',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {day}
              </div>
              {HOURS.map(hour => renderTimeSlot(index, hour))}
            </div>
          ))
        ) : (
          <div style={{ background: 'white' }}>
            <div style={{
              padding: '12px',
              background: '#f8f9fa',
              borderBottom: '1px solid #eee',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {DAYS[selectedDay]}
            </div>
            {HOURS.map(hour => renderTimeSlot(selectedDay, hour))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '18px',
              color: '#333',
              marginBottom: '16px'
            }}>
              Add New Task
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px'
                }}
              />
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTask.startTime}
                    onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newTask.endTime}
                    onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  />
                </div>
              </div>
              {view === 'weekly' && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    Day
                  </label>
                  <select
                    value={newTask.day}
                    onChange={(e) => setNewTask({ ...newTask, day: parseInt(e.target.value) })}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    {DAYS.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => setIsAddingTask(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6495ED',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 