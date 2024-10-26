import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, paymentAddress } = await req.json()

        if (!telegramId) {
            return NextResponse.json({ error: 'Invalid telegramId' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { paymentAddress }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating payment address:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
