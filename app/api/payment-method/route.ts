import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, paymentMethod } = await req.json()

        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { 
                telegramId: Number(telegramId)  // Ensure telegramId is a number
            },
            data: {
                paymentMethod,
                // Clear payment address when payment method is cleared
                paymentAddress: paymentMethod ? undefined : null
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
        const telegramId = req.nextUrl.searchParams.get('telegramId')

        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { 
                telegramId: Number(telegramId)  // Ensure telegramId is a number
            },
            select: { paymentMethod: true }
        })

        return NextResponse.json(user || { paymentMethod: null })
    } catch (error) {
        console.error('Error fetching payment method:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
