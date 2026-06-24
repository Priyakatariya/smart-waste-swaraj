// src/types.ts

export type WasteStatus = 'pending' | 'assigned' | 'completed';
export type ItemType = 'waste' | 'old_item'; // 'waste' for collection, 'old_item' for selling/donating
export type WasteCategory = 'biodegradable' | 'non_biodegradable' | 'recyclable_plastic' | 'recyclable_paper' | 'recyclable_metal' | 'e_waste' | 'hazardous' | 'other';

export interface User {
  id: string;
  email: string;
  name?: string; // Display name for user
  displayName?: string; // Often used for user-friendly names
  userType: 'generator' | 'collector';
  location?: { latitude: number; longitude: number };
  swarajPoints?: number;
  rating?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string; // To display commenter's name
  text: string;
  createdAt: string; // Changed to string to be consistent with parseISO from date-fns
}

// Define ContactInfo
export interface ContactInfo {
  phone?: string; // Optional phone number
  email?: string; // Optional email address
}

export interface WasteListing {
  id: string;
  userId: string; // ID of the generator (user who listed it)
  wasteType: string; // e.g., "Plastic Bottles", "Organic Food Scraps", "Old Books"
  quantity: string; // e.g., "10 kg", "2 bags", "1 unit" (string for flexibility)
  unit?: string; // Optional: "kg", "bags", "items"
  description?: string;
  status: WasteStatus; // 'pending', 'assigned', 'completed'
  location: LocationData; // Detailed location of the item/waste
  assignedCollectorId?: string; // ID of the collector, if assigned
  createdAt: string; // Changed to string to be consistent with parseISO from date-fns
  completedAt?: string; // Unix timestamp (Changed to string)

  // New fields for enhanced features:
  itemType: ItemType; // 'waste' or 'old_item'
  wasteCategory?: WasteCategory; // Specific category for 'waste' items
  imageUrl?: string; // URL to the uploaded image of the waste/item
  price?: number; // For 'old_item' type, if selling (optional)
  comments?: Comment[]; // For buyer/collector comments/interest

  // Crucially, add contactInfo to the main WasteListing interface
  contactInfo?: ContactInfo;
}

// WasteListingLocation for map, includes all relevant data for display
// This can extend WasteListing directly if it's meant to be a superset
export interface WasteListingLocation extends WasteListing {
  // No additional fields needed here if it's just a subset for the map.
  // If it truly had unique fields ONLY for map markers, they'd go here.
  // Otherwise, it can simply be an alias or extend WasteListing.
}