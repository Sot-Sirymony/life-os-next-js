'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isMobile = false, onClose }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/goals', label: 'Goals', icon: '🎯' },
    { href: '/categories', label: 'Categories', icon: '📂' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
    { href: '/planner', label: 'Weekly Planner', icon: '📅' },
    { href: '/progress', label: 'Progress', icon: '📈' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: '/test-responsive', label: 'Responsive Test', icon: '📱' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      width: isCollapsed ? '60px' : '280px',
      height: '100vh',
      background: '#fff',
      padding: isCollapsed ? '24px 12px' : '24px',
      borderRight: '2px solid #E6F0FF',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '2px 0 8px rgba(100,149,237,0.1)',
      transition: 'width 0.3s ease, padding 0.3s ease',
      position: 'relative'
    }}>
      {/* Close button for mobile */}
      {isMobile && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6495ED',
            zIndex: 10
          }}
        >
          ✕
        </button>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: isCollapsed ? '20px' : '28px', 
          color: '#6495ED',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
          {isCollapsed ? 'LO' : 'Life OS'}
        </h2>
        {!isCollapsed && (
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#666',
            fontFamily: "'PT Sans', sans-serif",
            textAlign: 'center'
          }}>
            Your Personal Life Management System
          </p>
        )}
      </div>
      
      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            onClick={isMobile ? onClose : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isCollapsed ? '0' : '12px',
              padding: isCollapsed ? '16px 8px' : '16px',
              borderRadius: '12px',
              color: pathname === item.href ? '#fff' : '#333',
              background: pathname === item.href ? '#6495ED' : 'transparent',
              textDecoration: 'none',
              marginBottom: '8px',
              transition: 'all 0.3s ease',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: isCollapsed ? '14px' : '16px',
              fontWeight: pathname === item.href ? 600 : 400,
              boxShadow: pathname === item.href ? '0 4px 12px rgba(100,149,237,0.3)' : 'none',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (pathname !== item.href) {
                e.target.style.background = '#E6F0FF';
                e.target.style.color = '#6495ED';
              }
            }}
            onMouseOut={(e) => {
              if (pathname !== item.href) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#333';
              }
            }}
            title={isCollapsed ? item.label : ''}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#333',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.3s ease',
                marginLeft: '8px',
                zIndex: 1000
              }}>
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #E6F0FF',
        textAlign: 'center'
      }}>
        {!isCollapsed && (
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#999',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            Version 1.0.0
          </p>
        )}
      </div>
    </div>
  );
} 