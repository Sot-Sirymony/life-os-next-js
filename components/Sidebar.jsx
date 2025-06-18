import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/goals', label: 'Goals', icon: '��' },
    { href: '/categories', label: 'Categories', icon: '📂' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
    { href: '/planner', label: 'Weekly Planner', icon: '📅' },
    { href: '/progress', label: 'Progress', icon: '📈' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
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
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '12px',
              color: router.pathname === item.href ? '#fff' : '#333',
              background: router.pathname === item.href ? '#6495ED' : 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '16px',
              fontWeight: router.pathname === item.href ? 600 : 400,
              boxShadow: router.pathname === item.href ? '0 4px 12px rgba(100,149,237,0.3)' : 'none'
            }}
            onMouseOver={(e) => {
              if (router.pathname !== item.href) {
                e.target.style.background = '#E6F0FF';
                e.target.style.color = '#6495ED';
              }
            }}
            onMouseOut={(e) => {
              if (router.pathname !== item.href) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#333';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #E6F0FF',
        textAlign: 'center'
      }}>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#999',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          Version 1.0.0
        </p>
      </div>
    </div>
  );
} 