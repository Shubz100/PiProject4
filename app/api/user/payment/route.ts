import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { telegramId, paymentMethod, paymentAddress } = await req.json();

    if (!telegramId || !paymentMethod || !paymentAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: { 
        paymentMethod,
        paymentAddress
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating payment info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { telegramId } = await req.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: { 
        paymentMethod: null,
        paymentAddress: null
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error removing payment info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}