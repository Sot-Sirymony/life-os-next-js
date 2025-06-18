import GoalCategories from '../../components/Goals/GoalCategories';
import Sidebar from '../../components/Sidebar';

export default function CategoriesPage() {
  return (
    <div style={{ 
      display: 'flex',
      background: '#E6F0FF',
      minHeight: '100vh',
      fontFamily: "'PT Sans', sans-serif"
    }}>
      <Sidebar />
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
            Goal Categories
          </h1>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px'
          }}>
            Manage and organize your life goals by categories.
          </p>
        </div>
        <GoalCategories />
      </main>
    </div>
  );
} 