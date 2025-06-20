'use client';

import LifeGoalsBoard from '@/components/Goals/LifeGoalsBoard';

export default function GoalsPage() {
  return (
    <div style={{ 
      display: 'flex',
      background: '#E6F0FF',
      minHeight: '100vh',
      fontFamily: "'PT Sans', sans-serif"
    }}>
      <div style={{
        width: '280px',
        height: '100vh',
        background: '#fff',
        padding: '24px',
        borderRight: '2px solid #E6F0FF',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '2px 0 8px rgba(100,149,237,0.1)'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '28px', 
            color: '#6495ED',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            textAlign: 'center'
          }}>
            Life OS
          </h2>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            textAlign: 'center'
          }}>
            Your Personal Life Management System
          </p>
        </div>
        
        <nav style={{ flex: 1 }}>
          <a 
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#333',
              background: 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            <span style={{ fontSize: '20px' }}>📊</span>
            <span>Dashboard</span>
          </a>
          <a 
            href="/goals"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#fff',
              background: '#6495ED',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(100,149,237,0.3)'
            }}
          >
            <span style={{ fontSize: '20px' }}>🎯</span>
            <span>Goals</span>
          </a>
          <a 
            href="/categories"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#333',
              background: 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            <span style={{ fontSize: '20px' }}>📂</span>
            <span>Categories</span>
          </a>
          <a 
            href="/tasks"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#333',
              background: 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            <span style={{ fontSize: '20px' }}>✅</span>
            <span>Tasks</span>
          </a>
          <a 
            href="/planner"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#333',
              background: 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            <span style={{ fontSize: '20px' }}>📅</span>
            <span>Planner</span>
          </a>
          <a 
            href="/progress"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#333',
              background: 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            <span style={{ fontSize: '20px' }}>📈</span>
            <span>Progress</span>
          </a>
          <a 
            href="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: '#333',
              background: 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span>Settings</span>
          </a>
        </nav>
      </div>
      <main style={{ 
        flex: 1, 
        padding: '24px',
        overflowY: 'auto'
      }}>
        <LifeGoalsBoard />
      </main>
    </div>
  );
} 