import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, paymentMethod, paymentAddress } = await req.json()

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId: parseInt(telegramId) },
            data: {
                paymentMethod: paymentMethod,
                paymentAddress: paymentMethod ? paymentAddress : null // Clear address when method is cleared
            }
        })

        return NextResponse.json(updatedUser)
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
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { telegramId: parseInt(telegramId) },
            select: { paymentMethod: true, paymentAddress: true }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching payment method:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
