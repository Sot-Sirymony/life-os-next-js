'use client';

import Sidebar from '../../components/Sidebar';
import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    aiOptimization: true,
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    weeklyReview: true,
    dailyReminders: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const SettingItem = ({ title, description, type = 'toggle', value, onChange, options }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #E6F0FF'
    }}>
      <div>
        <h3 style={{
          margin: '0 0 4px 0',
          fontSize: '16px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#666',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          {description}
        </p>
      </div>
      <div>
        {type === 'toggle' && (
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '50px',
            height: '24px'
          }}>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              style={{ display: 'none' }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: value ? '#6495ED' : '#ccc',
              borderRadius: '12px',
              transition: '0.3s'
            }} />
            <span style={{
              position: 'absolute',
              content: '""',
              height: '18px',
              width: '18px',
              left: '3px',
              bottom: '3px',
              background: 'white',
              borderRadius: '50%',
              transition: '0.3s',
              transform: value ? 'translateX(26px)' : 'translateX(0)'
            }} />
          </label>
        )}
        {type === 'select' && (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: '#fff',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '14px'
            }}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );

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
            Settings
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            Customize your Life OS experience and preferences.
          </p>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            fontSize: '20px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Preferences
          </h2>

          <SettingItem
            title="Notifications"
            description="Receive notifications for goal deadlines and task reminders"
            value={settings.notifications}
            onChange={(value) => handleSettingChange('notifications', value)}
          />

          <SettingItem
            title="AI Optimization"
            description="Enable AI-powered task optimization and time estimation"
            value={settings.aiOptimization}
            onChange={(value) => handleSettingChange('aiOptimization', value)}
          />

          <SettingItem
            title="Weekly Review"
            description="Get weekly progress summaries and goal reviews"
            value={settings.weeklyReview}
            onChange={(value) => handleSettingChange('weeklyReview', value)}
          />

          <SettingItem
            title="Daily Reminders"
            description="Receive daily task and goal reminders"
            value={settings.dailyReminders}
            onChange={(value) => handleSettingChange('dailyReminders', value)}
          />

          <SettingItem
            title="Theme"
            description="Choose your preferred color theme"
            type="select"
            value={settings.theme}
            onChange={(value) => handleSettingChange('theme', value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto' }
            ]}
          />

          <SettingItem
            title="Language"
            description="Select your preferred language"
            type="select"
            value={settings.language}
            onChange={(value) => handleSettingChange('language', value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' }
            ]}
          />

          <SettingItem
            title="Timezone"
            description="Set your local timezone for accurate scheduling"
            type="select"
            value={settings.timezone}
            onChange={(value) => handleSettingChange('timezone', value)}
            options={[
              { value: 'UTC', label: 'UTC' },
              { value: 'EST', label: 'Eastern Time' },
              { value: 'PST', label: 'Pacific Time' },
              { value: 'GMT', label: 'Greenwich Mean Time' }
            ]}
          />
        </div>
      </main>
    </div>
  );
} 