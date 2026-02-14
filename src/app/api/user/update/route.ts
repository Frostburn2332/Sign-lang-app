import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
    try {
        const { userId, name, email, currentPassword, newPassword } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: any = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Profile Update API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
