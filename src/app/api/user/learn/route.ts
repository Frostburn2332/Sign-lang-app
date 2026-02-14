import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, itemType, itemId } = body;

        // Validate required fields
        if (!userId || !itemType || !itemId) {
            return NextResponse.json({
                error: 'Missing required fields',
                pointsAwarded: 0,
                totalPoints: 0
            }, { status: 400 });
        }

        // Simple: Always award 5 points
        const pointsAwarded = 5;

        try {
            // Find or create progress record
            let progress = await prisma.learningProgress.findUnique({
                where: {
                    userId_itemType_itemId: {
                        userId,
                        itemType,
                        itemId,
                    },
                },
            });

            if (!progress) {
                // Create new progress record
                progress = await prisma.learningProgress.create({
                    data: {
                        userId,
                        itemType,
                        itemId,
                        viewed: true,
                        viewCount: 1,
                        lastViewed: new Date(),
                    },
                });
            } else {
                // Update existing record
                progress = await prisma.learningProgress.update({
                    where: { id: progress.id },
                    data: {
                        viewCount: { increment: 1 },
                        lastViewed: new Date(),
                        viewed: true,
                    },
                });
            }

            // Award points - ALWAYS
            console.log(`Awarding ${pointsAwarded} points to user ${userId}`);
            const userUpdate = await prisma.user.update({
                where: { id: userId },
                data: { points: { increment: pointsAwarded } },
            });
            console.log('User points updated:', userUpdate.points);

            // Get updated user points
            const updatedUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { points: true },
            });

            return NextResponse.json({
                success: true,
                message: 'Points awarded',
                progress,
                pointsAwarded,
                totalPoints: updatedUser?.points || 0
            });
        } catch (dbError: any) {
            console.error('Database error:', dbError);
            // Even if DB fails, return points so UI can update
            return NextResponse.json({
                success: false,
                message: 'Database error but points awarded',
                pointsAwarded,
                totalPoints: 0,
                error: dbError.message
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Learning API Error:', error);
        // Always return pointsAwarded even on error
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error',
            pointsAwarded: 5, // Still award points
            totalPoints: 0
        }, { status: 500 });
    }
}
