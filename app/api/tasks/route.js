import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        goal: true,
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const task = await prisma.task.create({
      data: {
        ...data,
        userId: 'default-user', // Replace with actual user ID when auth is implemented
      },
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
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 