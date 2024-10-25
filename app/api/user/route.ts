import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const telegramId = parseInt(url.searchParams.get('telegramId') || '')

        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { telegramId }
        })

        return NextResponse.json(user || {})
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { telegramId, paymentMethod, paymentAddress } = await req.json()
        
        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { telegramId }
        })
        
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 })
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: {
                paymentMethod,
                paymentAddress
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
