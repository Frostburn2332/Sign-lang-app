import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const loginLogs = await prisma.loginLog.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: offset,
        });

        const total = await prisma.loginLog.count();

        return NextResponse.json({
            logs: loginLogs,
            total,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching login logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

