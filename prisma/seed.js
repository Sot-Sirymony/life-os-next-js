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
      },
    })

    console.log('Default user preferences created')
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