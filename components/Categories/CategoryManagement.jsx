import React, { useState, useEffect } from 'react';

export default function CategoryManagement({ categories, onCategoriesChange }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isArchiving, setIsArchiving] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [error, setError] = useState(null);

  const handleEdit = (category) => {
    setEditingCategory(category);
  };

  const handleDelete = (category) => {
    setConfirmAction({ type: 'delete', category });
    setShowConfirmDialog(true);
  };

  const handleArchive = (category) => {
    setConfirmAction({ type: 'archive', category });
    setShowConfirmDialog(true);
  };

  const handleDuplicate = async (category) => {
    try {
      setIsDuplicating(category.id);
      const duplicatedCategory = {
        ...category,
        name: `${category.name} (Copy)`,
        isCustom: true,
        sortOrder: category.sortOrder + 1
      };
      delete duplicatedCategory.id; // Remove ID so it creates a new one
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedCategory),
      });

      if (response.ok) {
        const newCategory = await response.json();
        onCategoriesChange([...categories, newCategory]);
      } else {
        throw new Error('Failed to duplicate category');
      }
    } catch (error) {
      console.error('Error duplicating category:', error);
      setError('Failed to duplicate category');
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleReorder = async (categoryId, newOrder) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      const updatedCategory = { ...category, sortOrder: newOrder };
      
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (response.ok) {
        const updatedCategories = categories.map(c => 
          c.id === categoryId ? { ...c, sortOrder: newOrder } : c
        );
        onCategoriesChange(updatedCategories.sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        throw new Error('Failed to reorder category');
      }
    } catch (error) {
      console.error('Error reordering category:', error);
      setError('Failed to reorder category');
    }
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;

    try {
      const { type, category } = confirmAction;
      
      if (type === 'delete') {
        setIsDeleting(category.id);
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const updatedCategories = categories.filter(c => c.id !== category.id);
          onCategoriesChange(updatedCategories);
        } else {
          throw new Error('Failed to delete category');
        }
        setIsDeleting(null);
      } else if (type === 'archive') {
        setIsArchiving(category.id);
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...category, isArchived: true }),
        });

        if (response.ok) {
          const updatedCategories = categories.map(c => 
            c.id === category.id ? { ...c, isArchived: true } : c
          );
          onCategoriesChange(updatedCategories);
        } else {
          throw new Error('Failed to archive category');
        }
        setIsArchiving(null);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setError(`Failed to ${confirmAction.type} category`);
    } finally {
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  const handleSaveEdit = async (updatedCategory) => {
    try {
      const response = await fetch(`/api/categories/${updatedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (response.ok) {
        const updatedCategories = categories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        );
        onCategoriesChange(updatedCategories);
        setEditingCategory(null);
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError('Failed to update category');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

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
        Category Management
      </h2>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedCategories.map((category, index) => (
          <div
            key={category.id}
            style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              border: `2px solid ${category.color}30`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative'
            }}
          >
            {/* Drag Handle */}
            <div style={{
              cursor: 'grab',
              fontSize: '20px',
              color: '#666',
              userSelect: 'none'
            }}>
              ⋮⋮
            </div>

            {/* Category Icon */}
            <div style={{
              fontSize: '24px',
              background: category.color,
              color: '#fff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {category.icon}
            </div>

            {/* Category Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  color: '#333',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  {category.name}
                </h3>
                {category.isCustom && (
                  <span style={{
                    background: category.color,
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    Custom
                  </span>
                )}
                {category.isArchived && (
                  <span style={{
                    background: '#666',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    Archived
                  </span>
                )}
              </div>
              {category.description && (
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: "'PT Sans', sans-serif"
                }}>
                  {category.description}
                </p>
              )}
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                Order: {category.sortOrder}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => handleEdit(category)}
                disabled={isDeleting === category.id || isArchiving === category.id}
                style={{
                  background: '#6495ED',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: (isDeleting === category.id || isArchiving === category.id) ? 0.5 : 1
                }}
              >
                Edit
              </button>
              
              <button
                onClick={() => handleDuplicate(category)}
                disabled={isDuplicating === category.id}
                style={{
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: isDuplicating === category.id ? 0.5 : 1
                }}
              >
                {isDuplicating === category.id ? 'Copying...' : 'Duplicate'}
              </button>
              
              <button
                onClick={() => handleArchive(category)}
                disabled={isDeleting === category.id || isArchiving === category.id}
                style={{
                  background: '#FF9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: (isDeleting === category.id || isArchiving === category.id) ? 0.5 : 1
                }}
              >
                {isArchiving === category.id ? 'Archiving...' : 'Archive'}
              </button>
              
              <button
                onClick={() => handleDelete(category)}
                disabled={isDeleting === category.id || isArchiving === category.id}
                style={{
                  background: '#F44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: (isDeleting === category.id || isArchiving === category.id) ? 0.5 : 1
                }}
              >
                {isDeleting === category.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
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
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              Edit Category
            </h3>
            <CategoryEditForm
              category={editingCategory}
              onSave={handleSaveEdit}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
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
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 4px 24px rgba(100,149,237,0.18)',
            textAlign: 'center',
            fontFamily: "'PT Sans', sans-serif"
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {confirmAction.type === 'delete' ? '⚠️' : '📦'}
            </div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '18px',
              color: '#333',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 600
            }}>
              {confirmAction.type === 'delete' ? 'Delete Category' : 'Archive Category'}
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: '#666',
              fontSize: '14px'
            }}>
              Are you sure you want to {confirmAction.type} "{confirmAction.category.name}"?
              {confirmAction.type === 'delete' && ' This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={confirmActionHandler}
                style={{
                  background: confirmAction.type === 'delete' ? '#F44336' : '#FF9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {confirmAction.type === 'delete' ? 'Delete' : 'Archive'}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  background: '#eee',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontFamily: "'PT Sans', sans-serif",
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Category Edit Form Component
function CategoryEditForm({ category, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    icon: category.icon,
    color: category.color,
    sortOrder: category.sortOrder
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...category, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '60px',
            height: '44px'
          }}
        />
        <input
          type="number"
          value={formData.sortOrder}
          onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
          placeholder="Order"
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontFamily: "'PT Sans', sans-serif",
            width: '80px'
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
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
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
  );
} 