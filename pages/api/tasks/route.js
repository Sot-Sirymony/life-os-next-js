import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        goal: {
          include: {
            category: true
          }
        },
        activities: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
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

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        status: data.status || 'Not Started',
        priority: data.priority || 'Medium',
        timeEstimate: data.timeEstimate || null,
        timeSpent: data.timeSpent || 0,
        tools: data.tools || '',
        dueDate: data.dueDate || null,
        notes: data.notes || '',
        aiIntegration: data.aiIntegration || false,
        optimizationSuggestions: data.optimizationSuggestions || null,
        scheduledTime: data.scheduledTime || null,
        goalId: data.goalId || null,
        userId: defaultUser.id,
      },
      include: {
        goal: {
          include: {
            category: true
          }
        }
      }
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        type: 'task_created',
        description: `Created task: ${task.title}`,
        taskId: task.id,
        goalId: task.goalId,
        userId: defaultUser.id,
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        goal: {
          include: {
            category: true
          }
        }
      }
    });

    // Create activity record for updates
    if (Object.keys(updateData).length > 0) {
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@example.com' },
      });

      await prisma.activity.create({
        data: {
          type: 'task_updated',
          description: `Updated task: ${task.title}`,
          metadata: JSON.stringify(updateData),
          taskId: task.id,
          goalId: task.goalId,
          userId: defaultUser.id,
        }
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    // Get task details for activity log
    const task = await prisma.task.findUnique({
      where: { id }
    });

    // Delete associated activities
    await prisma.activity.deleteMany({
      where: { taskId: id }
    });

    await prisma.task.delete({
      where: { id },
    });

    // Create activity record for deletion
    if (task) {
      const defaultUser = await prisma.user.findUnique({
        where: { email: 'default@example.com' },
      });

      await prisma.activity.create({
        data: {
          type: 'task_deleted',
          description: `Deleted task: ${task.title}`,
          goalId: task.goalId,
          userId: defaultUser.id,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 