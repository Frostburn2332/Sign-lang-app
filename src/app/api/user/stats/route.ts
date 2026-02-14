import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get learning progress
        const progress = await prisma.learningProgress.findMany({
            where: { userId },
            orderBy: { lastViewed: 'desc' },
            take: 20,
        });

        // Get learning sessions
        const sessions = await prisma.learningSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate stats
        const totalAlphabets = 26;
        const totalWords = 8;

        const learnedAlphabets = progress.filter(
            p => p.itemType === 'alphabet' && p.mastered
        ).length;

        const learnedWords = progress.filter(
            p => p.itemType === 'word' && p.mastered
        ).length;

        const totalSessions = sessions.length;
        const totalTimeSpent = sessions.reduce((sum, session) => sum + session.duration, 0);

        // Get recent activity (viewed items)
        const recentActivity = progress
            .filter(p => p.viewed)
            .map(p => ({
                itemType: p.itemType,
                itemId: p.itemId,
                viewed: p.viewed,
                mastered: p.mastered,
                lastViewed: p.lastViewed?.toISOString() || null,
            }))
            .sort((a, b) => {
                if (!a.lastViewed) return 1;
                if (!b.lastViewed) return -1;
                return new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime();
            })
            .slice(0, 12);

        // Get user points
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        });

        return NextResponse.json({
            points: user?.points || 0,
            totalAlphabets,
            learnedAlphabets,
            totalWords,
            learnedWords,
            totalSessions,
            totalTimeSpent,
            recentActivity,
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

