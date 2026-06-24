import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Listing ID is required" }, { status: 400 });
    }

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Listing deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Listing Delete Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
