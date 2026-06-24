import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function GET(req: Request) {
  try {
    await connectToDB();
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // Optionally filter by userId, otherwise get all
    const query = userId ? { userId } : {};
    
    // Sort by createdAt descending so newest listings appear first
    const listings = await Listing.find(query).sort({ createdAt: -1 });

    // Ensure we map MongoDB _id to id for the frontend
    const formattedListings = listings.map(listing => {
      const listingObj = listing.toObject();
      return {
        ...listingObj,
        id: listingObj._id.toString(),
      };
    });

    return NextResponse.json(formattedListings, { status: 200 });
  } catch (err) {
    console.error("Fetch Listings Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
