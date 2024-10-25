import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json()

        if (!userData || !userData.id) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
        }

        let user = await prisma.user.findUnique({
            where: { telegramId: userData.id }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId: userData.id,
                    username: userData.username || '',
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    paymentMethod: null,
                    paymentAddress: null
                }
            })
        }

        // Handle disconnect request
        if (userData.disconnect) {
            user = await prisma.user.update({
                where: { telegramId: userData.id },
                data: { 
                    paymentMethod: null,
                    paymentAddress: null
                }
            })
        }
        // Handle connect request
        else if (userData.paymentMethod && userData.paymentAddress) {
            user = await prisma.user.update({
                where: { telegramId: userData.id },
                data: { 
                    paymentMethod: userData.paymentMethod,
                    paymentAddress: userData.paymentAddress
                }
            })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
