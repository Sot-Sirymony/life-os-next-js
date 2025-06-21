'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function ResponsiveLayout({ children, title, description }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ 
      display: 'flex',
      background: '#E6F0FF',
      minHeight: '100vh',
      fontFamily: "'PT Sans', sans-serif"
    }}>
      {/* Mobile Menu Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Responsive Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? 0 : '-280px') : 0,
        top: 0,
        height: '100vh',
        zIndex: 1000,
        transition: 'left 0.3s ease',
        background: '#fff',
        width: '280px',
        boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'
      }}>
        <Sidebar isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <main style={{ 
        flex: 1, 
        overflowY: 'auto'
      }}>
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              zIndex: 1001,
              background: '#6495ED',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              cursor: 'pointer',
              fontSize: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px'
            }}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        )}
        
        <div style={{ 
          marginBottom: '24px', 
          marginTop: isMobile ? '60px' : 0,
          padding: 'clamp(16px, 4vw, 24px)',
          paddingBottom: 0
        }}>
          {title && (
            <h1 style={{ 
              margin: '0 0 8px 0',
              fontSize: 'clamp(24px, 6vw, 32px)',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              lineHeight: 1.2
            }}>
              {title}
            </h1>
          )}
          {description && (
            <p style={{ 
              margin: 0,
              color: '#666',
              fontSize: 'clamp(14px, 3vw, 16px)',
              lineHeight: 1.5
            }}>
              {description}
            </p>
          )}
        </div>
        
        <div style={{ padding: '0 clamp(16px, 4vw, 24px) clamp(16px, 4vw, 24px)'}}>
          {children}
        </div>
      </main>
    </div>
  );
} 