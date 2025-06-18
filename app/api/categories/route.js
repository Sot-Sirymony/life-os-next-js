import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isArchived: false
      },
      include: {
        goals: {
          include: {
            tasks: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    // Add analytics data to each category
    const categoriesWithAnalytics = categories.map(category => {
      const totalGoals = category.goals.length;
      const completedGoals = category.goals.filter(g => g.status === 'Done').length;
      const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
      const totalTasks = category.goals.reduce((acc, goal) => acc + goal.tasks.length, 0);
      const completedTasks = category.goals.reduce((acc, goal) => 
        acc + goal.tasks.filter(t => t.status === 'Done').length, 0);

      return {
        ...category,
        analytics: {
          totalGoals,
          completedGoals,
          completionRate,
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      };
    });

    return NextResponse.json(categoriesWithAnalytics);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get the default user
    const defaultUser = await prisma.user.findUnique({
      where: { email: 'default@example.com' },
    });

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'Default user not found' },
        { status: 500 }
      );
    }

    // Get the highest sort order
    const maxSortOrder = await prisma.category.aggregate({
      where: { userId: defaultUser.id },
      _max: { sortOrder: true }
    });

    const newSortOrder = (maxSortOrder._max.sortOrder || 0) + 1;

    // Create category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || '',
        icon: data.icon || '📁',
        color: data.color || '#6495ED',
        isCustom: true,
        sortOrder: newSortOrder,
        userId: defaultUser.id,
      },
      include: {
        goals: {
          include: {
            tasks: true
          }
        }
      }
    });

    console.log('Created category:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        goals: {
          include: {
            tasks: true
          }
        }
      }
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error('PUT /api/categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has goals
    const categoryWithGoals = await prisma.category.findUnique({
      where: { id },
      include: {
        goals: true
      }
    });

    if (categoryWithGoals.goals.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing goals. Please reassign or delete goals first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
} 