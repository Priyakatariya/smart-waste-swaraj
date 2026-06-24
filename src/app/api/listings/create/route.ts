import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const data = await req.json();
    
    // Naya listing create karein
    const newListing = await Listing.create({
      ...data,
      status: 'pending',
      createdAt: new Date()
    });

    const listingObj = newListing.toObject();
    const formattedListing = {
      ...listingObj,
      id: listingObj._id.toString()
    };

    return NextResponse.json({ message: "Listing created successfully", listing: formattedListing }, { status: 201 });
  } catch (err) {
    console.error("Listing Create Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}