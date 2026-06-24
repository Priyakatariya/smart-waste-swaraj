// src/app/map/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react"; // Added useCallback
import dynamic from "next/dynamic";
const WasteMap = dynamic(() => import("../../components/map/WasteMap"), {
  ssr: false,
});
// Make sure MapList.tsx is indeed your detail panel component
import ListingDetailPanel from "../../components/map/MapList";
import {
  WasteListingLocation,
  ItemType,
  WasteCategory,
  WasteStatus,
} from "../../types"; // Import WasteStatus
import { useData } from "@/contexts/DataContext";
import { useRouter, useSearchParams } from "next/navigation";
import { FaSpinner, FaSearch, FaFilter, FaPlusCircle } from "react-icons/fa";
// Adjusted icons for better representation (GiPlasticBottle for plastic, GiPaper for paper)
import {
  GiMetalBar,
  GiOldLantern,
  GiRecycle,
  GiBattery100,
  GiHazardSign,
  GiPaper,
  GiWaterBottle, // <-- Use GiWaterBottle instead of GiPlasticBottle
} from "react-icons/gi";
import { RiLeafFill } from "react-icons/ri";
import styles from "./map-page.module.css"; // Main page layout CSS

// Helper component for Waste Counts
interface WasteCountCardProps {
  label: string;
  value: string; // This will now be like "5 items"
  icon: React.ReactNode;
  iconColor?: string;
}

const WasteCountCard: React.FC<WasteCountCardProps> = ({
  label,
  value,
  icon,
  iconColor,
}) => (
  <div className={styles.countCard}>
    <span className={styles.countIcon} style={{ color: iconColor }}>
      {icon}
    </span>
    <span className={styles.countLabel}>{label}</span>
    <span className={styles.countValue}>{value}</span>
  </div>
);

// Helper component for Map Controls
interface MapControlsComponentProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  onFilterCategory: (filter: WasteCategory | ItemType | "all") => void;
  selectedFilter: WasteCategory | ItemType | "all";
  onListNewWaste: () => void;
  totalCounts: {
    [key: string]: {
      count: number; // Only count is needed now
      unit: string;
    };
  };
}

const MapControlsComponent: React.FC<MapControlsComponentProps> = ({
  onSearch,
  searchTerm,
  onFilterCategory,
  selectedFilter,
  onListNewWaste,
  totalCounts,
}) => {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch(e.target.value);
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterCategory(e.target.value as WasteCategory | ItemType | "all");
    },
    [onFilterCategory]
  );

  return (
    <div className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>Map Controls & Analytics</h2>

      <div className={styles.controlsSection}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search waste by type, location..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className={styles.filterDropdown}>
          <label htmlFor="category-filter">
            <FaFilter /> Filter by Category:
          </label>
          <select
            id="category-filter"
            className={styles.selectInput}
            value={selectedFilter}
            onChange={handleFilterChange}
          >
            <option value="all">All Waste & Items</option>
            <option value="waste">All Waste</option>
            <option value="biodegradable">Biodegradable Waste</option>
            <option value="non_biodegradable">Non-Biodegradable Waste</option>
            <option value="recyclable_plastic">Recyclable Plastic</option>
            <option value="recyclable_paper">Recyclable Paper</option>
            <option value="recyclable_metal">Recyclable Metal</option>
            <option value="e_waste">E-Waste</option>
            <option value="hazardous">Hazardous Waste</option>
            <option value="other">Other Waste</option>
            <option value="old_item">Old Items (Reusable)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.addWasteButton} onClick={onListNewWaste} style={{ flex: 1 }}>
            <FaPlusCircle /> List New Waste
          </button>
          {(selectedFilter !== 'all' || searchTerm !== '') && (
            <button className={styles.addWasteButton} onClick={() => { onSearch(''); onFilterCategory('all'); }} style={{ flex: 1, backgroundColor: '#f44336' }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Changed Title to reflect "Items" instead of "Quantities" */}
      <h3 className={styles.sidebarTitle}>Total Items</h3>
      <div className={styles.wasteCounts}>
        {Object.keys(totalCounts).length === 0 ? (
          <p className={styles.noCountsMessage}>
            No items to display counts for yet with current filters.
          </p>
        ) : (
          Object.entries(totalCounts).map(([key, data]) => (
            <WasteCountCard
              key={key}
              label={
                // Special labels for aggregated counts, otherwise format category
                key === "all_waste_listings"
                  ? "All Waste Listings" // New aggregate key
                  : key === "all_old_items_listings"
                  ? "All Old Items Listings" // New aggregate key
                  : key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase()) // Format specific categories
              }
              value={`${data.count} ${data.unit}`} // <-- FIXED: Proper template literal
              icon={
                key === "biodegradable" ? (
                  <RiLeafFill />
                ) : key === "non_biodegradable" ? (
                  <GiRecycle />
                ) : key === "recyclable_plastic" ? (
                  <GiWaterBottle /> // <-- Use GiWaterBottle here
                ) : key === "recyclable_paper" ? (
                  <GiPaper /> // Changed icon
                ) : key === "recyclable_metal" ? (
                  <GiMetalBar />
                ) : key === "e_waste" ? (
                  <GiBattery100 />
                ) : key === "hazardous" ? (
                  <GiHazardSign />
                ) : key === "old_item" || key === "all_old_items_listings" ? (
                  <GiOldLantern /> // Grouped old_item and its aggregate
                ) : key === "all_waste_listings" ? (
                  <GiRecycle /> // Grouped all waste
                ) : (
                  <GiRecycle />
                ) // Default icon
              }
              iconColor={
                key === "biodegradable"
                  ? "#4CAF50"
                  : key === "non_biodegradable"
                  ? "#2196F3"
                  : key === "recyclable_plastic"
                  ? "#FFC107"
                  : key === "recyclable_paper"
                  ? "#9C27B0"
                  : key === "recyclable_metal"
                  ? "#795548"
                  : key === "e_waste"
                  ? "#607D8B"
                  : key === "hazardous"
                  ? "#F44336"
                  : key === "old_item" || key === "all_old_items_listings"
                  ? "#FF9800"
                  : key === "all_waste_listings"
                  ? "#333"
                  : "#333"
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default function MapPage() {
  // ⁠ wasteListings ⁠ from DataContext will be our source of truth for all listings.
  // We need a way to trigger updates in DataContext for status changes.
  const {
  user: currentUser,
  loading: dataContextLoading,
  wasteListings,
  users = [], // users ko add karein aur default khali array rakhein
  updateWasteListing,
} = useData();
  const router = useRouter();
  const searchParams = useSearchParams();

  // We no longer need mapLocations as a separate state if wasteListings is our source of truth.
  // Filtered locations will directly derive from wasteListings.
  const [loadingMapData, setLoadingMapData] = useState(true); // Still useful for initial load of DataContext
  const [errorMapData, setErrorMapData] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<
    WasteCategory | ItemType | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] =
    useState<WasteListingLocation | null>(null);

  const [initialFocusListingId, setInitialFocusListingId] = useState<
    string | null
  >(null);

  // Read URL parameter on component mount
  useEffect(() => {
    const listingIdParam = searchParams.get("listingId");
    if (listingIdParam) {
      setInitialFocusListingId(listingIdParam);
    }
  }, [searchParams]);

  // Handle data loading and authentication
  useEffect(() => {
    if (!dataContextLoading) {
      if (!currentUser) {
        router.push("/auth/login");
      } else {
        setLoadingMapData(false); // DataContext has finished loading
      }
    }
  }, [currentUser, dataContextLoading, router]);

  // Separate useEffect to handle initial focus listing from URL (only once)
  useEffect(() => {
    // Set selectedListing if initialFocusListingId is present and listings are loaded
    // Only do this if we haven't already set a selected listing
    if (initialFocusListingId && wasteListings && !selectedListing) {
      const listingToFocus = wasteListings.find(
        (l) => l.id === initialFocusListingId
      );
      if (listingToFocus) {
        setSelectedListing(listingToFocus);
      }
      // Clear the initialFocusListingId to prevent re-triggering
      setInitialFocusListingId(null);
    }
  }, [initialFocusListingId, wasteListings]); // Remove selectedListing from dependencies

  // Filter and search logic (now directly on ⁠ wasteListings ⁠ from DataContext)
  const filteredLocations = useMemo(() => {
    if (!wasteListings) return []; // Ensure wasteListings is not null or undefined

    let filtered = wasteListings;

    // Apply category filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "waste") {
        filtered = filtered.filter((loc) => loc.itemType === "waste");
      } else if (selectedFilter === "old_item") {
        filtered = filtered.filter((loc) => loc.itemType === "old_item");
      } else {
        // Specific waste categories
        filtered = filtered.filter(
          (loc) =>
            loc.itemType === "waste" && loc.wasteCategory === selectedFilter
        );
      }
    }

    // Apply search term
    if (searchTerm.trim()) {
      const searchWords = searchTerm.toLowerCase().split(/[\s,]+/).filter(w => w.length > 0);
      filtered = filtered.filter((loc) => {
        const searchableText = `${loc.wasteType} ${loc.wasteCategory || ''} ${loc.description || ''} ${loc.location.address || ''} ${loc.location.city || ''}`.toLowerCase();
        return searchWords.every(word => searchableText.includes(word));
      });
    }

    return filtered;
  }, [wasteListings, selectedFilter, searchTerm]); // Dependency is now wasteListings

  // Calculate total counts for display (only counting items)
  const totalCounts = useMemo(() => {
    const counts: { [key: string]: { count: number; unit: string } } = {}; // Changed type: only 'count'

    let totalWasteListings = 0;
    let totalOldItemsListings = 0;

    filteredLocations.forEach((listing) => {
      let key: string;
      if (listing.itemType === "waste" && listing.wasteCategory) {
        key = listing.wasteCategory;
        totalWasteListings += 1;
      } else if (listing.itemType === "old_item") {
        key = "old_item"; // Use a consistent key for all old items
        totalOldItemsListings += 1;
      } else {
        return; // Skip if no relevant category/type
      }

      // Initialize if not present. Unit is now fixed to 'items'
      if (!counts[key]) {
        counts[key] = { count: 0, unit: "items" };
      }

      counts[key].count += 1; // Only increment count
    });

    // Add aggregated totals at the top level
    if (totalWasteListings > 0) {
      counts["all_waste_listings"] = {
        count: totalWasteListings,
        unit: "items",
      };
    }
    if (totalOldItemsListings > 0) {
      counts["all_old_items_listings"] = {
        count: totalOldItemsListings,
        unit: "items",
      };
    }

    // Sort counts alphabetically by key, with aggregated totals at the top
    const sortedEntries = Object.entries(counts).sort(([keyA], [keyB]) => {
      // Custom sorting for specific keys if desired (e.g., all waste/items at top)
      if (keyA === "all_waste_listings") return -1;
      if (keyB === "all_waste_listings") return 1;
      if (keyA === "all_old_items_listings" && keyB !== "all_waste_listings")
        return -1;
      if (keyB === "all_old_items_listings" && keyA !== "all_waste_listings")
        return 1;
      return keyA.localeCompare(keyB);
    });

    return Object.fromEntries(sortedEntries);
  }, [filteredLocations]);

  const handleMarkerClick = useCallback(
    (location: WasteListingLocation) => {
      setSelectedListing(location);
      // When a marker is clicked, also update the URL to reflect the selected listing
      router.push(`/map?listingId=${location.id}`);
    },
    [router]
  );

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedListing(null);
    // Remove listingId from URL without adding a new history entry
    const currentPath = window.location.pathname;
    router.replace(currentPath);
  }, [router]);

  const handleListNewWaste = useCallback(() => {
    router.push("/list-waste");
  }, [router]);

  // NEW FUNCTION: Handles updating listing status and assigned collector
  const handleUpdateListingStatus = useCallback(
    async (
      listingId: string,
      newStatus: WasteStatus,
      collectorId: string | null = null, // Optional: if assigning to a collector
      commentText: string = "" // Optional: comment to add with update
    ) => {
      if (!updateWasteListing) {
        // Ensure updateWasteListing is available from DataContext
        console.error(
          "updateWasteListing function not available in DataContext."
        );
        return;
      }

      try {
        const currentListing = wasteListings?.find((l) => l.id === listingId);
        if (!currentListing) {
          console.error("Listing not found for update:", listingId);
          return;
        }

        const updatedFields: Partial<WasteListingLocation> = {
          status: newStatus,
        };

        // Only add assignedCollectorId if it's explicitly provided (for 'assigned' status)
        if (collectorId) {
          updatedFields.assignedCollectorId = collectorId;
        } else if (
          newStatus !== "assigned" &&
          currentListing.assignedCollectorId
        ) {
          // If status changes from assigned to something else, clear assignedCollectorId
          // This is a design choice; you might want to keep it for 'completed'
          updatedFields.assignedCollectorId = undefined;
        }

        // Add comment if provided
        if (commentText) {
          const newComment = {
            id: crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(2), // Generate a unique id
            userId: currentUser?.id || "system",
            userName:
              currentUser?.name || currentUser?.email || "System",
            text: commentText,
            createdAt: new Date().toISOString(),
          };
          updatedFields.comments = [
            ...(currentListing.comments || []),
            newComment,
          ];
        }

        await updateWasteListing(listingId, updatedFields);
        // DataContext's updateWasteListing should internally update its ⁠ wasteListings ⁠ state.
        // This will then automatically re-trigger filteredLocations and totalCounts.

        // Update the currently selected listing if it's the one being modified
        if (selectedListing?.id === listingId) {
          setSelectedListing((prev) => ({ ...prev!, ...updatedFields }));
        }

        alert(`Listing ${listingId} status updated to ${newStatus}!`);
      } catch (error) {
        console.error("Failed to update listing status:", error);
        alert("Failed to update listing status. Please try again.");
      }
    },
    [updateWasteListing, wasteListings, currentUser, selectedListing]
  ); // Depend on updateWasteListing, wasteListings, currentUser, selectedListing

  // Overall loading state for the page
  if (dataContextLoading || loadingMapData || !currentUser) {
    // Check currentUser here
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading Map and Data...</p>
      </div>
    );
  }

  // Handle unauthorized access (if user is null after loading)
  if (!currentUser) {
    // Redundant check, but good for clarity after initial load
    // This block might be less reachable if router.push already happened,
    // but serves as a fallback.
    return (
      <div className={styles.unauthorizedContainer}>
        <h1>Access Denied</h1>
        <p>Please log in to view the Waste Map.</p>
        <button
          className={styles.loginRedirectButton}
          onClick={() => router.push("/auth/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.mapPageContainer}>
      <header className={styles.mapHeader}>
        <h1 className={styles.mapTitle}>Waste & Reusable Item Map</h1>
        <p className={styles.mapSubtitle}>
          Discover waste collection points and valuable reusable items in your
          area.
        </p>
      </header>

      <div className={styles.mapContentWrapper}>
        {/* Sidebar with Controls and Counts */}
        <MapControlsComponent
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
          onFilterCategory={setSelectedFilter}
          selectedFilter={selectedFilter}
          onListNewWaste={handleListNewWaste}
          totalCounts={totalCounts}
        />

        {/* Main Map Section */}
        <div className={styles.mapSection}>
          {errorMapData && (
            <div className={styles.errorMessage}>
              <p>Error: {errorMapData}</p>
            </div>
          )}

          {/* Messages for no listings based on filters/search */}
          {filteredLocations.length === 0 &&
            searchTerm === "" &&
            selectedFilter === "all" && (
              <div className={styles.noListingsMessage}>
                <p>No waste listings available. Be the first to list!</p>
              </div>
            )}
          {filteredLocations.length === 0 &&
            (searchTerm !== "" || selectedFilter !== "all") && (
              <div className={styles.noListingsMessage}>
                <p>No listings match your current filters or search term.</p>
              </div>
            )}
          <div className={styles.mapContainer}>
            <WasteMap
              locations={filteredLocations}
              onMarkerClick={handleMarkerClick}
              focusListingId={selectedListing?.id || initialFocusListingId}
            />
          </div>
        </div>
      </div>

      {/* Listing Detail Panel (Modal/Sidebar) */}
      {selectedListing && (
        <ListingDetailPanel
          listing={selectedListing}
          currentUser={currentUser}
          users={users}
          onClose={handleCloseDetailPanel}
          onUpdateListingStatus={handleUpdateListingStatus}
        />
      )}
    </div>
  );
}