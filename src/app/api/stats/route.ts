import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDB();
    
    const userCount = await User.countDocuments();
    const completedListings = await Listing.countDocuments({ status: 'completed' });
    
    const completed = await Listing.find({ status: 'completed' });
    let totalWasteRecycled = 0;
    completed.forEach(l => {
        const qty = parseFloat(l.quantity) || 0;
        // simplistic conversion, assuming mostly kg
        totalWasteRecycled += qty;
    });

    return NextResponse.json({
        userCount,
        completedListings,
        totalWasteRecycled: Math.round(totalWasteRecycled)
    }, { status: 200 });
  } catch (err) {
    console.error("Stats Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
