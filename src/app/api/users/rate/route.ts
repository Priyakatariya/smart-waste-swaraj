import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { targetUserId, rating } = await req.json();

    if (!targetUserId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    await connectToDB();

    let user;
    try {
      user = await User.findById(targetUserId);
    } catch (e) {
      return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const currentRating = user.rating || 0;
    const currentCount = user.reviewsCount || 0;

    const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
    
    user.rating = newRating;
    user.reviewsCount = currentCount + 1;
    await user.save();

    return NextResponse.json({ message: "Rating submitted successfully", newRating: user.rating }, { status: 200 });
  } catch (err) {
    console.error("Rate User Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
