import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { telegramId, paymentMethod, paymentAddress } = await req.json()

    if (!telegramId) {
      return NextResponse.json({ error: 'Invalid telegram ID' }, { status: 400 })
    }

    // Update user's payment method and address, replacing any existing ones
    const updatedUser = await prisma.user.update({
      where: { telegramId: telegramId },
      data: {
        paymentMethod: paymentMethod,
        paymentAddress: paymentAddress || null // Set to null if not provided (for disconnecting)
      }
    })

    return NextResponse.json({
      success: true,
      paymentMethod: updatedUser.paymentMethod,
      paymentAddress: updatedUser.paymentAddress
    })
  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const telegramId = searchParams.get('telegramId')

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegram ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(telegramId) },
      select: {
        paymentMethod: true,
        paymentAddress: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      paymentMethod: user.paymentMethod,
      paymentAddress: user.paymentAddress
    })
  } catch (error) {
    console.error('Error fetching payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
