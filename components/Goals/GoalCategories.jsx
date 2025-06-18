import React, { useState } from 'react';

const categoryGroups = {
  Foundations: [
    { id: 'self-dev', name: 'Self-Development & Learning', icon: '📚' },
    { id: 'health', name: 'Health & Wellness', icon: '💪' },
    { id: 'financial', name: 'Financial Security', icon: '💰' },
    { id: 'personal', name: 'Personal Growth', icon: '🌱' }
  ],
  'People & Impact': [
    { id: 'relationships', name: 'Relationships', icon: '❤️' },
    { id: 'community', name: 'Community Involvement', icon: '🤝' },
    { id: 'social', name: 'Social Connection', icon: '👥' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' }
  ],
  'Achievement & Enjoyment': [
    { id: 'career', name: 'Career & Professional Growth', icon: '💼' },
    { id: 'hobbies', name: 'Hobbies & Recreation', icon: '🎨' },
    { id: 'travel', name: 'Travel & Adventure', icon: '✈️' },
    { id: 'creative', name: 'Creative Expression', icon: '🎭' }
  ]
};

export default function GoalCategories() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', group: Object.keys(categoryGroups)[0] });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    // Here you would typically add the category to your state management system
    setIsAddingCategory(false);
    setNewCategory({ name: '', group: Object.keys(categoryGroups)[0] });
  };

  return (
    <div style={{ padding: '20px' }}>
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

      {/* Category Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.entries(categoryGroups).map(([groupName, categories]) => (
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
              {categories.map((category) => (
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
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{category.icon}</span>
                  <span style={{ 
                    fontFamily: "'PT Sans', sans-serif",
                    color: '#333'
                  }}>
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
            minWidth: '300px',
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
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc'
                }}
              />
              <select
                value={newCategory.group}
                onChange={(e) => setNewCategory({ ...newCategory, group: e.target.value })}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc'
                }}
              >
                {Object.keys(categoryGroups).map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    background: '#6495ED',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  style={{
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    cursor: 'pointer'
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