import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // Get telegramId from query params or headers
        const telegramId = req.headers.get('telegram-id') || req.nextUrl.searchParams.get('telegramId')
        
        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { telegramId: parseInt(telegramId) }
        })

        return NextResponse.json(user || {})
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json()
        const telegramId = userData.telegramId || userData.id

        if (!telegramId) {
            return NextResponse.json({ error: 'Telegram ID required' }, { status: 400 })
        }

        let user = await prisma.user.findUnique({
            where: { telegramId: parseInt(telegramId) }
        })

        // Create user if they don't exist
        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId: telegramId,
                    username: userData.username || '',
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    paymentMethod: null
                }
            })
        }

        // Prepare update data
        const updateData: any = {}
        if (userData.paymentMethod) updateData.paymentMethod = userData.paymentMethod
        if (userData.paymentAddress) updateData.paymentAddress = userData.paymentAddress

        // Update user if there's any update data
        if (Object.keys(updateData).length > 0) {
            user = await prisma.user.update({
                where: { telegramId: parseInt(telegramId) },
                data: updateData
            })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
