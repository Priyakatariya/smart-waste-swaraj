import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDB();
    
    // Fetch users but exclude sensitive info like passwords
    const users = await User.find({}, { password: 0 });

    const formattedUsers = users.map(user => {
      const userObj = user.toObject();
      return {
        ...userObj,
        id: userObj._id.toString()
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
