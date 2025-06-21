const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Create a temporary Prisma client for SQLite
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function exportData() {
  try {
    console.log('📤 Exporting data from SQLite...');
    
    const exportData = {
      users: [],
      categories: [],
      goals: [],
      tasks: [],
      activities: [],
      userPreferences: [],
      timestamp: new Date().toISOString()
    };

    // Export Users
    console.log('Exporting users...');
    exportData.users = await sqliteClient.user.findMany();
    
    // Export Categories
    console.log('Exporting categories...');
    exportData.categories = await sqliteClient.category.findMany();
    
    // Export Goals
    console.log('Exporting goals...');
    exportData.goals = await sqliteClient.goal.findMany();
    
    // Export Tasks
    console.log('Exporting tasks...');
    exportData.tasks = await sqliteClient.task.findMany();
    
    // Export Activities
    console.log('Exporting activities...');
    exportData.activities = await sqliteClient.activity.findMany();
    
    // Export User Preferences
    console.log('Exporting user preferences...');
    exportData.userPreferences = await sqliteClient.userPreferences.findMany();

    // Save to file
    const exportPath = path.join(__dirname, 'sqlite-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Data exported successfully to: ${exportPath}`);
    console.log(`📊 Export summary:`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Categories: ${exportData.categories.length}`);
    console.log(`   - Goals: ${exportData.goals.length}`);
    console.log(`   - Tasks: ${exportData.tasks.length}`);
    console.log(`   - Activities: ${exportData.activities.length}`);
    console.log(`   - User Preferences: ${exportData.userPreferences.length}`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
  } finally {
    await sqliteClient.$disconnect();
  }
}

exportData(); 