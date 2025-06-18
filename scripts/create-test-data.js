const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Get the default user
    const user = await prisma.user.findUnique({
      where: { email: 'default@example.com' }
    });

    if (!user) {
      console.error('Default user not found');
      return;
    }

    // Create test goals
    const goals = await Promise.all([
      prisma.goal.create({
        data: {
          title: 'Learn React Development',
          description: 'Master React fundamentals and advanced concepts',
          category: 'Self-Development & Learning',
          status: 'In Progress',
          progress: 60,
          timeframe: 'Short',
          priority: 'High',
          userId: user.id
        }
      }),
      prisma.goal.create({
        data: {
          title: 'Build Personal Portfolio',
          description: 'Create a professional portfolio website',
          category: 'Career & Professional Growth',
          status: 'Not Started',
          progress: 0,
          timeframe: 'Mid',
          priority: 'Medium',
          userId: user.id
        }
      }),
      prisma.goal.create({
        data: {
          title: 'Exercise 3 Times a Week',
          description: 'Establish a regular fitness routine',
          category: 'Health & Wellness',
          status: 'Done',
          progress: 100,
          timeframe: 'Short',
          priority: 'High',
          userId: user.id
        }
      }),
      prisma.goal.create({
        data: {
          title: 'Save $5000 for Emergency Fund',
          description: 'Build financial security with emergency savings',
          category: 'Financial Security',
          status: 'In Progress',
          progress: 40,
          timeframe: 'Long',
          priority: 'High',
          userId: user.id
        }
      }),
      prisma.goal.create({
        data: {
          title: 'Learn Spanish',
          description: 'Achieve conversational fluency in Spanish',
          category: 'Personal Growth',
          status: 'Not Started',
          progress: 0,
          timeframe: 'Long',
          priority: 'Medium',
          userId: user.id
        }
      })
    ]);

    console.log('Created goals:', goals.length);

    // Create test tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Complete React Tutorial',
          description: 'Finish the official React tutorial',
          status: 'Done',
          priority: 'High',
          timeEstimate: 120,
          tools: 'Browser, Code Editor',
          aiIntegration: true,
          userId: user.id,
          goalId: goals[0].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Build Todo App',
          description: 'Create a simple todo application with React',
          status: 'In Progress',
          priority: 'Medium',
          timeEstimate: 90,
          tools: 'React, CSS',
          aiIntegration: true,
          userId: user.id,
          goalId: goals[0].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Design Portfolio Layout',
          description: 'Create wireframes and design for portfolio',
          status: 'Not Started',
          priority: 'Medium',
          timeEstimate: 60,
          tools: 'Figma, Design Tools',
          aiIntegration: false,
          userId: user.id,
          goalId: goals[1].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Morning Workout',
          description: 'Complete 30-minute morning exercise routine',
          status: 'Done',
          priority: 'High',
          timeEstimate: 30,
          tools: 'Gym Equipment',
          aiIntegration: false,
          userId: user.id,
          goalId: goals[2].id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Research Investment Options',
          description: 'Research and compare different investment strategies',
          status: 'In Progress',
          priority: 'Medium',
          timeEstimate: 180,
          tools: 'Financial Websites, Calculator',
          aiIntegration: true,
          userId: user.id,
          goalId: goals[3].id
        }
      })
    ]);

    console.log('Created tasks:', tasks.length);
    console.log('✅ Test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData(); 