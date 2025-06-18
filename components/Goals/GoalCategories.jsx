import React, { useState, useEffect } from 'react';
import CategoryDetailView from '../Categories/CategoryDetailView';
import CategoryAnalytics from '../Categories/CategoryAnalytics';
import CategoryManagement from '../Categories/CategoryManagement';
import CategoryTemplates from '../Categories/CategoryTemplates';

export default function GoalCategories() {
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '📁', color: '#6495ED' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('categories'); // categories, analytics, management, templates

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [categoriesResponse, goalsResponse, tasksResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/goals'),
        fetch('/api/tasks')
      ]);
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } else {
        throw new Error('Failed to fetch categories');
      }
      
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);
      } else {
        throw new Error('Failed to fetch goals');
      }
      
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (response.ok) {
        await fetchData();
        setIsAddingCategory(false);
        setNewCategory({ name: '', description: '', icon: '📁', color: '#6495ED' });
      } else {
        throw new Error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category');
    }
  };

  const handleCategoriesChange = (newCategories) => {
    setCategories(newCategories);
  };

  const groupCategories = (categories) => {
    const groups = {
      'Foundations': [],
      'People & Impact': [],
      'Achievement & Enjoyment': [],
      'Custom': []
    };

    categories.forEach(category => {
      if (category.isCustom) {
        groups['Custom'].push(category);
      } else {
        // Map categories to groups based on name
        if (category.name.includes('Self-Development') || category.name.includes('Health') || 
            category.name.includes('Financial') || category.name.includes('Personal')) {
          groups['Foundations'].push(category);
        } else if (category.name.includes('Relationship') || category.name.includes('Community') || 
                   category.name.includes('Social') || category.name.includes('Family')) {
          groups['People & Impact'].push(category);
        } else if (category.name.includes('Career') || category.name.includes('Hobby') || 
                   category.name.includes('Travel') || category.name.includes('Creative')) {
          groups['Achievement & Enjoyment'].push(category);
        } else {
          groups['Foundations'].push(category);
        }
      }
    });

    return groups;
  };

  const handleEditCategory = (category) => {
    // This will be handled by CategoryManagement component
    console.log('Edit category:', category);
  };

  const handleDeleteCategory = (category) => {
    // This will be handled by CategoryManagement component
    console.log('Delete category:', category);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#666', fontFamily: "'PT Sans', sans-serif" }}>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#F44336', fontFamily: "'PT Sans', sans-serif" }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            background: '#6495ED',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontFamily: "'PT Sans', sans-serif",
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const categoryGroups = groupCategories(categories);

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", color: '#6495ED', margin: 0 }}>Goal Categories</h2>
        <button
          onClick={() => setIsAddingCategory(true)}
          style={{
            background: '#6495ED',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Add Category
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '2px solid #E6F0FF',
        paddingBottom: '8px'
      }}>
        {[
          { id: 'categories', label: 'Categories', icon: '📂' },
          { id: 'analytics', label: 'Analytics', icon: '📊' },
          { id: 'management', label: 'Management', icon: '⚙️' },
          { id: 'templates', label: 'Templates', icon: '🎨' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: activeTab === tab.id ? '#6495ED' : '#E6F0FF',
              color: activeTab === tab.id ? '#fff' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'PT Sans', sans-serif",
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' && (
        <div>
          {/* Category Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(categoryGroups).map(([groupName, groupCategories]) => {
              if (groupCategories.length === 0) return null;
              
              return (
                <div key={groupName}>
                  <h3 style={{ 
                    fontFamily: "'Poppins', sans-serif", 
                    color: '#333',
                    marginBottom: '16px',
                    fontSize: '1.2rem'
                  }}>
                    {groupName}
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px'
                  }}>
                    {groupCategories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        style={{
                          background: selectedCategory?.id === category.id ? '#D8BFD8' : '#fff',
                          padding: '16px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(100,149,237,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: `2px solid ${category.color}30`,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 16px rgba(100,149,237,0.15)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(100,149,237,0.08)';
                        }}
                      >
                        {/* Category Icon with Color */}
                        <div style={{
                          fontSize: '24px',
                          background: category.color,
                          color: '#fff',
                          borderRadius: '50%',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {category.icon}
                        </div>
                        
                        {/* Category Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontFamily: "'PT Sans', sans-serif",
                            color: '#333',
                            fontWeight: 600,
                            fontSize: '16px',
                            marginBottom: '4px'
                          }}>
                            {category.name}
                          </div>
                          {category.description && (
                            <div style={{
                              fontFamily: "'PT Sans', sans-serif",
                              color: '#666',
                              fontSize: '14px'
                            }}>
                              {category.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Custom Badge */}
                        {category.isCustom && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: category.color,
                            color: '#fff',
                            borderRadius: '8px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontFamily: "'PT Sans', sans-serif",
                            fontWeight: 600
                          }}>
                            Custom
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <CategoryAnalytics 
          categories={categories} 
          goals={goals} 
          tasks={tasks} 
        />
      )}

      {activeTab === 'management' && (
        <CategoryManagement 
          categories={categories} 
          onCategoriesChange={handleCategoriesChange} 
        />
      )}

      {activeTab === 'templates' && (
        <CategoryTemplates 
          onTemplateSelect={() => {}} 
          onCategoriesChange={handleCategoriesChange} 
        />
      )}

      {/* Category Detail View Modal */}
      {selectedCategory && (
        <CategoryDetailView
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {/* Add Category Modal */}
      {isAddingCategory && (
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
          justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '90vw',
            boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <h3 style={{ 
              fontFamily: "'Poppins', sans-serif",
              color: '#6495ED',
              marginBottom: '16px'
            }}>
              Add New Category
            </h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category Name"
                required
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontFamily: "'PT Sans', sans-serif"
                }}
              />
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Category Description (optional)"
                rows="3"
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontFamily: "'PT Sans', sans-serif",
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  placeholder="Icon (emoji)"
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    fontFamily: "'PT Sans', sans-serif",
                    width: '100px'
                  }}
                />
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    width: '60px',
                    height: '44px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#6495ED',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  style={{
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 