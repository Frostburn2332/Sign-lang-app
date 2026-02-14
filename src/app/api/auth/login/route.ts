import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get request metadata
        const ipAddress = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const user = await prisma.user.findUnique({
            where: { email },
        });

        let loginSuccess = false;

        if (!user) {
            // Log failed login attempt
            await prisma.loginLog.create({
                data: {
                    email,
                    success: false,
                    ipAddress,
                    userAgent,
                },
            });
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Log failed login attempt
            await prisma.loginLog.create({
                data: {
                    email,
                    success: false,
                    ipAddress,
                    userAgent,
                },
            });
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Log successful login attempt
        await prisma.loginLog.create({
            data: {
                email,
                success: true,
                ipAddress,
                userAgent,
            },
        });

        return NextResponse.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
