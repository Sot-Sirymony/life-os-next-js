// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Goals API
const goalsApi = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/goals`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch goals');
      }
      return res.json();
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  create: async (goalData) => {
    try {
      // Validate required fields
      if (!goalData.title || !goalData.category) {
        throw new Error('Title and category are required');
      }

      const res = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create goal');
      }

      return res.json();
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  update: async (id, goalData) => {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...goalData }),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/goals`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to delete goal');
    return res.json();
  },
};

// Tasks API
const tasksApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  create: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  update: async (id, taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...taskData }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return res.json();
  },
};

module.exports = { goalsApi, tasksApi }; 