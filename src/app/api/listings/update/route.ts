import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Listing from '@/models/Listing';
import User from '@/models/User';

export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const data = await req.json();
    const { id, ...updateFields } = data;

    if (!id) {
      return NextResponse.json({ message: "Listing ID is required" }, { status: 400 });
    }

    // Add completedAt if status is changing to 'completed'
    if (updateFields.status === 'completed') {
      updateFields.completedAt = new Date();
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true } // return updated document
    );

    if (!updatedListing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    // Award Swaraj Points
    if (updateFields.status === 'completed') {
      try {
        const generatorId = updatedListing.userId;
        const collectorId = updatedListing.assignedCollectorId;
        if (generatorId) await User.findByIdAndUpdate(generatorId, { $inc: { swarajPoints: 50 } });
        if (collectorId) await User.findByIdAndUpdate(collectorId, { $inc: { swarajPoints: 50 } });
      } catch (pointsErr) {
        console.error("Failed to award points:", pointsErr);
      }
    }

    // Format for frontend
    const formattedListing = {
      ...updatedListing.toObject(),
      id: updatedListing._id.toString()
    };

    return NextResponse.json({ message: "Listing updated successfully", listing: formattedListing }, { status: 200 });
  } catch (err) {
    console.error("Listing Update Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
