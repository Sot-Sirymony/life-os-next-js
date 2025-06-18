'use client';

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
        </nav>
      </div>
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
            Life Goals
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            Define, track, and manage your life goals with comprehensive planning and analytics.
          </p>
        </div>
        
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            color: '#333',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600
          }}>
            Goals Page Working!
          </h2>
          <p style={{ margin: 0, color: '#666' }}>
            The goals page is now accessible. The LifeGoalsBoard component will be loaded here.
          </p>
        </div>
      </main>
    </div>
  );
} 