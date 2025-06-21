'use client';

import ResponsiveLayout from '../../components/ResponsiveLayout';
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
      flexDirection: 'column',
      gap: 'clamp(8px, 2vw, 12px)',
      padding: 'clamp(12px, 3vw, 16px) 0',
      borderBottom: '1px solid #E6F0FF'
    }}>
      <div style={{ flex: 1 }}>
        <h3 style={{
          margin: '0 0 4px 0',
          fontSize: 'clamp(14px, 3vw, 16px)',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0,
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          color: '#666',
          fontFamily: "'PT Sans', sans-serif",
          lineHeight: 1.4
        }}>
          {description}
        </p>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        minWidth: 'fit-content'
      }}>
        {type === 'toggle' && (
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: 'clamp(44px, 6vw, 50px)',
            height: 'clamp(20px, 3vw, 24px)'
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
              height: 'clamp(14px, 2.5vw, 18px)',
              width: 'clamp(14px, 2.5vw, 18px)',
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
              padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: '#fff',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              minWidth: 'clamp(120px, 20vw, 150px)'
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
    <ResponsiveLayout 
      title="Settings" 
      description="Customize your Life OS experience and preferences."
    >
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: 'clamp(16px, 4vw, 24px)',
        boxShadow: '0 2px 8px rgba(100,149,237,0.08)'
      }}>
        <h2 style={{
          margin: '0 0 clamp(16px, 4vw, 24px) 0',
          fontSize: 'clamp(18px, 4vw, 20px)',
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
    </ResponsiveLayout>
  );
} 