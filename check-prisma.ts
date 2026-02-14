// 1. Import the singleton, NOT the raw PrismaClient
import prisma from "@/lib/prisma"; 
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  // 2. Use it just like before
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
    },
  });

  return NextResponse.json(user);
}