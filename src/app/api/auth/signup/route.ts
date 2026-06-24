import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { name, email, password, userType } = await req.json();

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // 2. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create new user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      userType
    });

    return NextResponse.json({ message: "User created successfully", userId: newUser._id }, { status: 201 });
  } catch (err) {
    console.error("Signup Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}