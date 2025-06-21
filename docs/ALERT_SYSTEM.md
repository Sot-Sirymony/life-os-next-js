# Alert System Documentation

## Overview

The alert system provides a consistent way to show success, error, warning, and info messages to users throughout the Life OS application. It includes auto-dismiss functionality, smooth animations, and support for multiple alerts.

## Components

### 1. Alert Component (`components/common/Alert.jsx`)

A single alert component that displays a message with an icon and close button.

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info' (default: 'info')
- `message`: The message to display
- `duration`: Auto-dismiss duration in milliseconds (default: 5000)
- `onClose`: Callback function when alert is closed
- `show`: Boolean to control visibility (default: true)
- `position`: Position for standalone alerts (default: 'top-right')

### 2. AlertContainer Component (`components/common/AlertContainer.jsx`)

Container component that manages multiple alerts with proper stacking and positioning.

**Props:**
- `alerts`: Array of alert objects
- `onRemoveAlert`: Callback function to remove an alert
- `position`: Position for the container (default: 'top-right')

### 3. useAlert Hook (`hooks/useAlert.js`)

Custom hook that provides alert management functions.

**Returns:**
- `alerts`: Array of current alerts
- `showAlert(type, message, duration)`: Show any type of alert
- `showSuccess(message, duration)`: Show success alert
- `showError(message, duration)`: Show error alert
- `showWarning(message, duration)`: Show warning alert
- `showInfo(message, duration)`: Show info alert
- `removeAlert(id)`: Remove specific alert
- `clearAllAlerts()`: Remove all alerts

## Usage

### Basic Setup

1. Import the hook and container in your component:

```jsx
import useAlert from '../../hooks/useAlert';
import AlertContainer from '../common/AlertContainer';
```

2. Initialize the hook:

```jsx
const { alerts, showSuccess, showError, removeAlert } = useAlert();
```

3. Add the AlertContainer to your JSX:

```jsx
return (
  <div>
    {/* Your component content */}
    
    <AlertContainer 
      alerts={alerts} 
      onRemoveAlert={removeAlert} 
      position="top-right" 
    />
  </div>
);
```

### Showing Alerts

```jsx
// Success message
showSuccess('Goal created successfully!');

// Error message
showError('Failed to create goal. Please try again.');

// Warning message
showWarning('This action cannot be undone.');

// Info message
showInfo('Your changes have been saved.');

// Custom duration (10 seconds)
showSuccess('Custom duration message', 10000);
```

### CRUD Operations with Alerts

Here's how to integrate alerts with CRUD operations:

```jsx
const handleCreateGoal = async () => {
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });

    if (response.ok) {
      const newGoal = await response.json();
      setGoals([...goals, newGoal]);
      showSuccess('Goal created successfully!');
    } else {
      throw new Error('Failed to create goal');
    }
  } catch (error) {
    console.error('Error creating goal:', error);
    showError('Failed to create goal. Please try again.');
  }
};

const handleUpdateGoal = async (goal) => {
  try {
    const response = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });

    if (response.ok) {
      const updatedGoal = await response.json();
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      showSuccess('Goal updated successfully!');
    } else {
      throw new Error('Failed to update goal');
    }
  } catch (error) {
    console.error('Error updating goal:', error);
    showError('Failed to update goal. Please try again.');
  }
};

const handleDeleteGoal = async (id) => {
  try {
    const response = await fetch('/api/goals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      setGoals(goals.filter(goal => goal.id !== id));
      showSuccess('Goal deleted successfully!');
    } else {
      throw new Error('Failed to delete goal');
    }
  } catch (error) {
    console.error('Error deleting goal:', error);
    showError('Failed to delete goal. Please try again.');
  }
};
```

## Alert Types and Styling

### Success Alerts
- **Color**: Green (#d4edda)
- **Icon**: Checkmark (✓)
- **Use case**: Successful operations, confirmations

### Error Alerts
- **Color**: Red (#f8d7da)
- **Icon**: X mark (✗)
- **Use case**: Failed operations, validation errors

### Warning Alerts
- **Color**: Yellow (#fff3cd)
- **Icon**: Warning triangle (⚠)
- **Use case**: Important notices, confirmations for destructive actions

### Info Alerts
- **Color**: Blue (#d1ecf1)
- **Icon**: Information circle (ℹ)
- **Use case**: General information, tips

## Positioning Options

The alert system supports multiple positioning options:

- `top-right` (default)
- `top-left`
- `bottom-right`
- `bottom-left`
- `top-center`
- `bottom-center`

## Features

- **Auto-dismiss**: Alerts automatically disappear after 5 seconds (configurable)
- **Manual close**: Users can manually close alerts by clicking the X button
- **Smooth animations**: Fade in/out and slide animations
- **Multiple alerts**: Support for multiple alerts stacking vertically
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

## Best Practices

1. **Be specific**: Use clear, actionable messages
2. **Consistent timing**: Use 5 seconds for most alerts, longer for important info
3. **Error handling**: Always show error messages when operations fail
4. **Success feedback**: Confirm successful operations to users
5. **Avoid spam**: Don't show too many alerts at once

## Integration Status

The alert system has been integrated into the following components:

- ✅ LifeGoalsBoard
- ✅ GoalManagement
- ✅ GoalDetailView
- ✅ TaskManagement
- ✅ GoalCategories

All CRUD operations (Create, Read, Update, Delete) now show appropriate success and error messages to users. 