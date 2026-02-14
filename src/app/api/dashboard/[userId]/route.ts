import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = params.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        console.log('Dashboard API User:', user);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get learning progress stats
        const progress = await prisma.learningProgress.findMany({
            where: { userId },
        });

        const masteredCount = progress.filter(p => p.mastered).length;
        const totalViewed = progress.length;

        // Get recent sessions
        const recentSessions = await prisma.learningSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        // Calculate total learning time
        const allSessions = await prisma.learningSession.findMany({
            where: { userId },
            select: { duration: true },
        });
        const totalDurationSeconds = allSessions.reduce((acc, curr) => acc + curr.duration, 0);

        // Format user data (exclude password, format dates)
        const formattedUser = {
            id: user.id,
            name: user.name || '',
            email: user.email,
            points: user.points || 0,
            createdAt: user.createdAt.toISOString(),
        };

        // Format recent sessions
        const formattedSessions = recentSessions.map(session => ({
            id: session.id,
            duration: session.duration,
            itemsLearned: session.itemsLearned,
            pointsEarned: session.pointsEarned || 0,
            createdAt: session.createdAt.toISOString(),
        }));

        // Get recent detailed activity
        const recentActivityRaw = await prisma.learningProgress.findMany({
            where: { userId },
            orderBy: { lastViewed: 'desc' },
            take: 10,
        });

        const recentActivity = recentActivityRaw.map(activity => ({
            id: activity.id,
            type: activity.itemType, // 'alphabet' or 'word'
            item: activity.itemId,
            action: activity.viewCount === 1 ? 'Learned' : 'Practiced',
            timestamp: activity.lastViewed ? activity.lastViewed.toISOString() : activity.createdAt.toISOString(),
        }));

        // Calculate total points earned from sessions
        const totalPointsEarned = recentSessions.reduce((sum, session) => sum + (session.pointsEarned || 0), 0);

        return NextResponse.json({
            user: formattedUser,
            stats: {
                masteredCount,
                totalViewed,
                totalDurationSeconds,
                totalPointsEarned,
            },
            recentSessions: formattedSessions,
            recentActivity,
        });
    } catch (error: any) {
        console.error('Dashboard API Error:', error);
        console.error('Error details:', error.message);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}
