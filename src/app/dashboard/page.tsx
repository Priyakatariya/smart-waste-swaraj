'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext'; // FIX: Correct Path
import { WasteListing, User, WasteStatus } from '../../types'; 
import { FaBoxes, FaLeaf, FaSpinner, FaCheckCircle, FaMapMarkedAlt, FaClipboardCheck } from 'react-icons/fa';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  // FIX: Destructure updateWasteListing instead of old specific functions
  const { 
    user: currentUser, 
    loading, 
    wasteListings = [], 
    users = [], 
    updateWasteListing 
  } = useData();
  
  const router = useRouter();
  const [viewRole, setViewRole] = useState<'generator' | 'collector' | null>(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login');
    } else if (currentUser && !viewRole) {
      setViewRole(currentUser.userType);
    }
  }, [currentUser, loading, router, viewRole]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading Dashboard Data...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  // --- Logic for filtering listings remains the same ---
  const userListings: WasteListing[] = viewRole === 'generator'
    ? wasteListings.filter((listing: WasteListing) => listing.userId === currentUser.id)
    : wasteListings.filter((listing: WasteListing) => 
        listing.assignedCollectorId === currentUser?.id || 
        (listing.status === 'pending' && listing.itemType === 'waste')
      );

  const pendingListings = userListings.filter((listing: WasteListing) => listing.status === 'pending');
  const completedListings = userListings.filter((listing: WasteListing) => listing.status === 'completed');

  // Helper functions
  const getGeneratorName = (userId: string) => {
    const generator = users.find((u: User) => u.id === userId);
    return generator ? generator.name : 'Unknown';
  };

  // --- Card UI Component ---
  const Card = ({ title, value, icon, bgColor }: any) => (
    <div className={`${styles.dashboardCard} ${bgColor}`}>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardValue}>{value}</p>
      </div>
      <div className={styles.cardIcon}>{icon}</div>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.welcomeTitle}>
        Welcome, {currentUser?.name || currentUser?.email.split('@')[0]}!
      </h1>

      {/* Role Toggle */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setViewRole('generator')} 
          style={{ padding: '10px 20px', borderRadius: '5px', background: viewRole === 'generator' ? '#4CAF50' : '#ddd', color: viewRole === 'generator' ? '#fff' : '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Generator Dashboard
        </button>
        <button 
          onClick={() => setViewRole('collector')} 
          style={{ padding: '10px 20px', borderRadius: '5px', background: viewRole === 'collector' ? '#2196F3' : '#ddd', color: viewRole === 'collector' ? '#fff' : '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Collector Dashboard
        </button>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <Card title="Total Listings" value={userListings.length} icon={<FaBoxes />} bgColor={styles.cardBgBlue} />
        <Card title="Pending" value={pendingListings.length} icon={<FaLeaf />} bgColor={styles.cardBgOrange} />
        <Card title="Completed" value={completedListings.length} icon={<FaCheckCircle />} bgColor={styles.cardBgGreen} />
      </div>

      <h2 className={styles.listingsSectionTitle}>
        {viewRole === 'generator' ? 'Your Waste Listings' : 'Waste/Items for Collection'}
      </h2>

      <div className={styles.listingsGrid}>
        {userListings.length > 0 ? (
          userListings.map(listing => (
            <div key={listing.id} className={styles.listingCard}>
              <div className={styles.listingInfo}>
                <h4 className={styles.listingTitle}>{listing.wasteType} - {listing.quantity} {listing.unit}</h4>
                <p>Status: <span className={styles.statusBadge}>{listing.status}</span></p>
              </div>

              <div className={styles.listingActions}>
                <button onClick={() => router.push(`/map?listingId=${listing.id}`)} className={styles.viewMapButton}>
                  <FaMapMarkedAlt /> Map
                </button>

                {/* COLLECTOR ACTIONS FIX */}
                {viewRole === 'collector' && (
                  <div className={styles.collectorActions}>
                    {listing.status === 'pending' && (
                      <button 
                        // FIX: Use updateWasteListing to assign
                        onClick={() => updateWasteListing?.(listing.id, { status: 'assigned', assignedCollectorId: currentUser.id })}
                        className={styles.actionButtonAssign}
                      >
                        <FaClipboardCheck /> Assign
                      </button>
                    )}
                    {listing.status === 'assigned' && listing.assignedCollectorId === currentUser.id && (
                      <button 
                        // FIX: Use updateWasteListing to complete
                        onClick={() => updateWasteListing?.(listing.id, { status: 'completed' })}
                        className={styles.actionButtonComplete}
                      >
                        <FaCheckCircle /> Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noData}>No listings to show.</p>
        )}
      </div>
    </div>
  );
}