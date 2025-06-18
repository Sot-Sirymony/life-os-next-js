import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        tasks: true,
      },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error('GET /api/goals error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received goal data:', data);
    
    // Validate required fields
    if (!data.title || !data.category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
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

    // Create goal with default values for optional fields
    const goal = await prisma.goal.create({
      data: {
        title: data.title,
        description: data.description || '',
        category: data.category,
        status: data.status || 'Not Started',
        progress: data.progress || 0,
        timeframe: data.timeframe || 'Short',
        priority: data.priority || 'Medium',
        userId: defaultUser.id,
      },
    });

    console.log('Created goal:', goal);
    return NextResponse.json(goal);
  } catch (error) {
    console.error('POST /api/goals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create goal' },
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
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        tasks: true,
      },
    });
    return NextResponse.json(goal);
  } catch (error) {
    console.error('PUT /api/goals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update goal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    await prisma.goal.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/goals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete goal' },
      { status: 500 }
    );
  }
} 