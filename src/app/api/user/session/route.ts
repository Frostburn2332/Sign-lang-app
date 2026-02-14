import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { userId, duration, itemsLearned, pointsEarned } = await request.json();

        if (!userId || !duration) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Simple: just track the points earned during the session
        const totalPointsEarned = pointsEarned || 0;

        const session = await prisma.learningSession.create({
            data: {
                userId,
                duration: Math.round(duration), // Duration in seconds
                itemsLearned: itemsLearned || 0,
                pointsEarned: totalPointsEarned,
            },
        });

        return NextResponse.json({ 
            success: true, 
            session,
            totalPointsEarned 
        });
    } catch (error) {
        console.error('Error creating learning session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

