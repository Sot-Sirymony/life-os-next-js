import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || '',
        icon: data.icon || '📁',
        color: data.color || '#6495ED',
      },
      include: {
        goals: {
          include: {
            tasks: true
          }
        }
      }
    });

    console.log('Updated category:', category);
    return NextResponse.json(category);
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

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

    if (!categoryWithGoals) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (categoryWithGoals.goals.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing goals. Please reassign or delete goals first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    console.log('Deleted category:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
} 