import React, { useState } from 'react';
import { FaRobot, FaClock, FaHistory, FaCheck } from 'react-icons/fa';

export default function AITimeEstimator({ onTimeEstimate, initialTask = '' }) {
  const [taskDescription, setTaskDescription] = useState(initialTask);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [historicalData, setHistoricalData] = useState([
    { task: 'Write a blog post', time: 120 },
    { task: 'Code review', time: 45 },
    { task: 'Team meeting', time: 60 },
    { task: 'Research new technology', time: 90 }
  ]);

  const analyzeTask = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      // This is a simple simulation - in a real app, this would use actual AI
      const words = taskDescription.toLowerCase().split(' ');
      let baseTime = 30; // Base time in minutes
      
      // Adjust time based on keywords
      if (words.includes('research') || words.includes('study')) baseTime += 60;
      if (words.includes('write') || words.includes('document')) baseTime += 45;
      if (words.includes('meeting') || words.includes('discuss')) baseTime += 30;
      if (words.includes('review') || words.includes('check')) baseTime += 20;
      
      // Adjust based on task length
      baseTime += Math.floor(words.length / 2);
      
      // Find similar historical tasks
      const similarTasks = historicalData.filter(h => 
        h.task.toLowerCase().includes(words[0]) || 
        words.some(w => h.task.toLowerCase().includes(w))
      );
      
      if (similarTasks.length > 0) {
        const avgHistoricalTime = similarTasks.reduce((acc, curr) => acc + curr.time, 0) / similarTasks.length;
        baseTime = Math.round((baseTime + avgHistoricalTime) / 2);
      }
      
      setEstimatedTime(baseTime);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleApplyEstimate = () => {
    if (estimatedTime) {
      onTimeEstimate(estimatedTime);
    }
  };

  const handleAdjustTime = (adjustment) => {
    setEstimatedTime(prev => Math.max(5, prev + adjustment));
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '100%',
      maxWidth: '600px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <FaRobot style={{ color: '#6495ED', fontSize: '24px' }} />
        <h3 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: '20px',
          color: '#333',
          margin: 0
        }}>
          AI Time Estimator
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            Task Description
          </label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Describe your task in detail..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        <button
          onClick={analyzeTask}
          disabled={!taskDescription.trim() || isAnalyzing}
          style={{
            background: '#6495ED',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '14px',
            cursor: !taskDescription.trim() || isAnalyzing ? 'not-allowed' : 'pointer',
            opacity: !taskDescription.trim() || isAnalyzing ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isAnalyzing ? (
            <>
              <FaClock /> Analyzing...
            </>
          ) : (
            <>
              <FaRobot /> Estimate Time
            </>
          )}
        </button>

        {estimatedTime && (
          <div style={{
            background: '#E6F0FF',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              color: '#6495ED',
              fontSize: '16px',
              fontWeight: 500
            }}>
              <FaClock /> Estimated Time
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#333'
              }}>
                {estimatedTime} minutes
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleAdjustTime(-5)}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  -5
                </button>
                <button
                  onClick={() => handleAdjustTime(5)}
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                >
                  +5
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              color: '#666',
              fontSize: '14px'
            }}>
              <FaHistory /> Based on similar tasks:
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#666'
            }}>
              {historicalData
                .filter(h => h.task.toLowerCase().includes(taskDescription.toLowerCase().split(' ')[0]))
                .map((task, index) => (
                  <li key={index}>
                    {task.task}: {task.time} minutes
                  </li>
                ))}
            </ul>

            <button
              onClick={handleApplyEstimate}
              style={{
                background: '#6495ED',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <FaCheck /> Apply Estimate
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 