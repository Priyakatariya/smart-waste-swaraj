import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { email, password } = await req.json();

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 3. Return user data (excluding password) to frontend
    return NextResponse.json({ 
      message: "Login successful", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        userType: user.userType 
      } 
    }, { status: 200 });

  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}