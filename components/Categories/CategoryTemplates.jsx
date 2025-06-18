import React, { useState, useEffect } from 'react';

export default function CategoryTemplates({ onTemplateSelect, onCategoriesChange }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);
  const [error, setError] = useState(null);

  const categoryTemplates = {
    'Life Balance': {
      description: 'Comprehensive life management with balanced focus areas',
      icon: '⚖️',
      color: '#6495ED',
      categories: [
        { name: 'Health & Wellness', icon: '🏃‍♂️', color: '#4CAF50', description: 'Physical and mental well-being' },
        { name: 'Career & Professional', icon: '💼', color: '#FF9800', description: 'Work and professional development' },
        { name: 'Relationships', icon: '❤️', color: '#E91E63', description: 'Family, friends, and social connections' },
        { name: 'Personal Growth', icon: '🌱', color: '#9C27B0', description: 'Learning and self-improvement' },
        { name: 'Financial Security', icon: '💰', color: '#FFD700', description: 'Money management and financial goals' },
        { name: 'Hobbies & Recreation', icon: '🎨', color: '#00BCD4', description: 'Leisure activities and creative pursuits' }
      ]
    },
    'Productivity Focus': {
      description: 'Optimized for maximum productivity and achievement',
      icon: '🚀',
      color: '#FF9800',
      categories: [
        { name: 'Work Projects', icon: '📊', color: '#6495ED', description: 'Professional projects and tasks' },
        { name: 'Learning Goals', icon: '📚', color: '#4CAF50', description: 'Skills development and education' },
        { name: 'Health & Fitness', icon: '💪', color: '#F44336', description: 'Physical health and exercise' },
        { name: 'Financial Goals', icon: '💳', color: '#FFD700', description: 'Financial planning and investments' },
        { name: 'Personal Development', icon: '🎯', color: '#9C27B0', description: 'Self-improvement and growth' }
      ]
    },
    'Wellness & Mindfulness': {
      description: 'Focus on holistic wellness and mindful living',
      icon: '🧘‍♀️',
      color: '#4CAF50',
      categories: [
        { name: 'Physical Health', icon: '🏃‍♀️', color: '#4CAF50', description: 'Exercise, nutrition, and physical well-being' },
        { name: 'Mental Health', icon: '🧠', color: '#9C27B0', description: 'Emotional well-being and stress management' },
        { name: 'Spiritual Growth', icon: '✨', color: '#FFD700', description: 'Spiritual practices and inner peace' },
        { name: 'Social Connections', icon: '🤝', color: '#E91E63', description: 'Meaningful relationships and community' },
        { name: 'Life Balance', icon: '⚖️', color: '#6495ED', description: 'Work-life balance and harmony' }
      ]
    },
    'Creative Pursuits': {
      description: 'Designed for artists, creators, and creative professionals',
      icon: '🎨',
      color: '#E91E63',
      categories: [
        { name: 'Artistic Projects', icon: '🎨', color: '#E91E63', description: 'Creative projects and artistic endeavors' },
        { name: 'Skill Development', icon: '🎭', color: '#9C27B0', description: 'Learning new creative skills' },
        { name: 'Portfolio Building', icon: '📁', color: '#6495ED', description: 'Building and showcasing work' },
        { name: 'Creative Business', icon: '💼', color: '#FF9800', description: 'Monetizing creative work' },
        { name: 'Inspiration & Research', icon: '🔍', color: '#00BCD4', description: 'Finding inspiration and references' }
      ]
    },
    'Student Life': {
      description: 'Perfect for students managing academics and personal growth',
      icon: '🎓',
      color: '#9C27B0',
      categories: [
        { name: 'Academic Goals', icon: '📚', color: '#6495ED', description: 'Study goals and academic achievements' },
        { name: 'Career Preparation', icon: '💼', color: '#FF9800', description: 'Internships, networking, and career prep' },
        { name: 'Personal Development', icon: '🌱', color: '#4CAF50', description: 'Life skills and personal growth' },
        { name: 'Social Life', icon: '👥', color: '#E91E63', description: 'Friendships and social activities' },
        { name: 'Health & Wellness', icon: '🏃‍♂️', color: '#F44336', description: 'Physical and mental health' }
      ]
    },
    'Entrepreneur': {
      description: 'Tailored for entrepreneurs and business owners',
      icon: '💼',
      color: '#FF9800',
      categories: [
        { name: 'Business Development', icon: '📈', color: '#4CAF50', description: 'Growing and scaling the business' },
        { name: 'Product Development', icon: '🔧', color: '#6495ED', description: 'Creating and improving products/services' },
        { name: 'Marketing & Sales', icon: '📢', color: '#E91E63', description: 'Marketing strategies and sales goals' },
        { name: 'Financial Management', icon: '💰', color: '#FFD700', description: 'Business finances and investments' },
        { name: 'Personal Growth', icon: '🎯', color: '#9C27B0', description: 'Leadership and personal development' }
      ]
    }
  };

  const handleTemplateSelect = (templateName) => {
    setSelectedTemplate(templateName);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsCreatingFromTemplate(true);
      setError(null);

      const template = categoryTemplates[selectedTemplate];
      const newCategories = [];

      // Create categories from template
      for (let i = 0; i < template.categories.length; i++) {
        const categoryData = template.categories[i];
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...categoryData,
            isCustom: true,
            sortOrder: i + 1
          }),
        });

        if (response.ok) {
          const newCategory = await response.json();
          newCategories.push(newCategory);
        } else {
          throw new Error(`Failed to create category: ${categoryData.name}`);
        }
      }

      // Update categories list
      onCategoriesChange(newCategories);
      setSelectedTemplate(null);
      
    } catch (error) {
      console.error('Error creating categories from template:', error);
      setError('Failed to create categories from template. Please try again.');
    } finally {
      setIsCreatingFromTemplate(false);
    }
  };

  const handleCustomTemplate = () => {
    // This would open a custom template creation interface
    console.log('Custom template creation');
  };

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
        Category Templates
      </h2>

      <p style={{
        margin: '0 0 24px 0',
        color: '#666',
        fontSize: '14px',
        fontFamily: "'PT Sans', sans-serif"
      }}>
        Choose from predefined category templates or create your own custom setup
      </p>

      {error && (
        <div style={{
          background: '#FFEBEE',
          color: '#F44336',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#F44336',
              marginLeft: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Template Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {Object.entries(categoryTemplates).map(([templateName, template]) => (
          <div
            key={templateName}
            onClick={() => handleTemplateSelect(templateName)}
            style={{
              background: selectedTemplate === templateName ? '#E3F2FD' : '#f8f9fa',
              borderRadius: '10px',
              padding: '20px',
              border: `2px solid ${selectedTemplate === templateName ? template.color : '#E6F0FF'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (selectedTemplate !== templateName) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 16px rgba(100,149,237,0.15)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedTemplate !== templateName) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {/* Template Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                fontSize: '24px',
                background: template.color,
                color: '#fff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {template.icon}
              </div>
              <div>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '16px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  {templateName}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  {template.description}
                </p>
              </div>
            </div>

            {/* Template Categories Preview */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {template.categories.slice(0, 4).map((category, index) => (
                <span
                  key={index}
                  style={{
                    background: category.color,
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontFamily: "'PT Sans', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {category.name}
                </span>
              ))}
              {template.categories.length > 4 && (
                <span style={{
                  background: '#666',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontFamily: "'PT Sans', sans-serif",
                  fontWeight: 600
                }}>
                  +{template.categories.length - 4} more
                </span>
              )}
            </div>

            {/* Template Stats */}
            <div style={{ fontSize: '12px', color: '#666', fontFamily: "'PT Sans', sans-serif" }}>
              {template.categories.length} categories • Ready to use
            </div>

            {/* Selection Indicator */}
            {selectedTemplate === templateName && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: template.color,
                color: '#fff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Template Option */}
      <div style={{
        background: '#f8f9fa',
        borderRadius: '10px',
        padding: '20px',
        border: '2px dashed #ccc',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎨</div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          color: '#333',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600
        }}>
          Create Custom Template
        </h3>
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#666',
          fontFamily: "'PT Sans', sans-serif"
        }}>
          Design your own category structure from scratch
        </p>
        <button
          onClick={handleCustomTemplate}
          style={{
            background: '#6495ED',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontFamily: "'PT Sans', sans-serif",
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Create Custom Template
        </button>
      </div>

      {/* Action Buttons */}
      {selectedTemplate && (
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleCreateFromTemplate}
            disabled={isCreatingFromTemplate}
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              opacity: isCreatingFromTemplate ? 0.5 : 1
            }}
          >
            {isCreatingFromTemplate ? 'Creating Categories...' : `Use "${selectedTemplate}" Template`}
          </button>
          <button
            onClick={() => setSelectedTemplate(null)}
            style={{
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontFamily: "'PT Sans', sans-serif",
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                fontSize: '32px',
                background: categoryTemplates[selectedTemplate].color,
                color: '#fff',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {categoryTemplates[selectedTemplate].icon}
              </div>
              <div>
                <h2 style={{
                  margin: '0 0 4px 0',
                  fontSize: '24px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  {selectedTemplate}
                </h2>
                <p style={{
                  margin: 0,
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {categoryTemplates[selectedTemplate].description}
                </p>
              </div>
            </div>

            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Included Categories
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {categoryTemplates[selectedTemplate].categories.map((category, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: `2px solid ${category.color}30`
                  }}
                >
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
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      color: '#333',
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600
                    }}>
                      {category.name}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {category.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleCreateFromTemplate}
                disabled={isCreatingFromTemplate}
                style={{
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  opacity: isCreatingFromTemplate ? 0.5 : 1
                }}
              >
                {isCreatingFromTemplate ? 'Creating...' : 'Use This Template'}
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  background: '#eee',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 