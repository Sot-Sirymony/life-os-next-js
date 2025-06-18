const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Create default user if it doesn't exist
    const defaultUser = await prisma.user.upsert({
      where: { email: 'default@example.com' },
      update: {},
      create: {
        email: 'default@example.com',
        name: 'Default User',
      },
    })

    console.log('Default user created:', defaultUser)

    // Create default user preferences
    await prisma.userPreferences.upsert({
      where: { userId: defaultUser.id },
      update: {},
      create: {
        userId: defaultUser.id,
        theme: 'light',
        notifications: true,
        aiOptimization: true,
        weeklyReview: true,
        dailyReminders: true,
        language: 'en',
        timezone: 'UTC'
      },
    })

    console.log('Default user preferences created')

    // Create default categories
    const defaultCategories = [
      {
        name: 'Self-Development & Learning',
        description: 'Personal growth and skill development',
        icon: '📚',
        color: '#6495ED',
        isCustom: false,
        sortOrder: 1
      },
      {
        name: 'Health & Wellness',
        description: 'Physical and mental health goals',
        icon: '💪',
        color: '#4CAF50',
        isCustom: false,
        sortOrder: 2
      },
      {
        name: 'Financial Security',
        description: 'Financial planning and security',
        icon: '💰',
        color: '#FF9800',
        isCustom: false,
        sortOrder: 3
      },
      {
        name: 'Personal Growth',
        description: 'Personal development and self-improvement',
        icon: '🌱',
        color: '#9C27B0',
        isCustom: false,
        sortOrder: 4
      },
      {
        name: 'Relationships',
        description: 'Building and maintaining relationships',
        icon: '❤️',
        color: '#E91E63',
        isCustom: false,
        sortOrder: 5
      },
      {
        name: 'Community Involvement',
        description: 'Contributing to community and society',
        icon: '🤝',
        color: '#3F51B5',
        isCustom: false,
        sortOrder: 6
      },
      {
        name: 'Social Connection',
        description: 'Social activities and networking',
        icon: '👥',
        color: '#00BCD4',
        isCustom: false,
        sortOrder: 7
      },
      {
        name: 'Family',
        description: 'Family-related goals and activities',
        icon: '👨‍👩‍👧‍👦',
        color: '#8BC34A',
        isCustom: false,
        sortOrder: 8
      },
      {
        name: 'Career & Professional Growth',
        description: 'Professional development and career advancement',
        icon: '💼',
        color: '#607D8B',
        isCustom: false,
        sortOrder: 9
      },
      {
        name: 'Hobbies & Recreation',
        description: 'Leisure activities and hobbies',
        icon: '🎨',
        color: '#FF5722',
        isCustom: false,
        sortOrder: 10
      },
      {
        name: 'Travel & Adventure',
        description: 'Travel and adventure goals',
        icon: '✈️',
        color: '#795548',
        isCustom: false,
        sortOrder: 11
      },
      {
        name: 'Creative Expression',
        description: 'Creative and artistic pursuits',
        icon: '🎭',
        color: '#9E9E9E',
        isCustom: false,
        sortOrder: 12
      }
    ];

    const categories = await Promise.all(
      defaultCategories.map(cat => 
        prisma.category.create({
          data: {
            ...cat,
            userId: defaultUser.id
          }
        })
      )
    );

    console.log('Default categories created:', categories.length);
  } catch (error) {
    console.error('Error in seed script:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error running seed script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 