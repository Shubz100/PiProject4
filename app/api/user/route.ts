import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const user = await prisma.user.findFirst()
        return NextResponse.json(user || {})
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { paymentMethod, paymentAddress } = await req.json()
        
        // Get the first user and update their payment info
        const user = await prisma.user.findFirst()
        
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
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
