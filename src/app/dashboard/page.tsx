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
  const [ratingModal, setRatingModal] = useState<{isOpen: boolean, targetUserId: string, targetName: string}>({isOpen: false, targetUserId: '', targetName: ''});

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
        listing.userId !== currentUser.id && // Exclude my own listings from marketplace
        (listing.assignedCollectorId === currentUser.id || listing.status === 'pending')
      );

  const pendingListings = userListings.filter((listing: WasteListing) => listing.status === 'pending');
  const completedListings = userListings.filter((listing: WasteListing) => listing.status === 'completed');

  const handleRate = async (rating: number) => {
    try {
      const res = await fetch('/api/users/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: ratingModal.targetUserId, rating })
      });
      if (res.ok) {
        alert("Rating submitted!");
      } else {
        alert("Failed to submit rating.");
      }
    } catch (err) {
      console.error(err);
    }
    setRatingModal({ isOpen: false, targetUserId: '', targetName: '' });
  };

  const getGeneratorName = (userId: string) => {
    const generator = users.find((u: User) => u.id === userId);
    return generator ? generator.name : 'Unknown';
  };

  const getCollectorName = (userId: string) => {
    const collector = users.find((u: User) => u.id === userId);
    return collector ? collector.name : 'Unknown';
  };

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
      
      {/* Gamification Stats Header */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ background: 'linear-gradient(135deg, #4CAF50, #81C784)', color: 'white', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(76,175,80,0.3)' }}>
          <span style={{ fontSize: '1.2em' }}>🌱</span> 
          {/* Default to 0 if undefined */}
          {currentUser?.swarajPoints || 0} Swaraj Points
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FFC107, #FFD54F)', color: 'black', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(255,193,7,0.3)' }}>
          <span style={{ fontSize: '1.2em' }}>⭐</span> 
          {currentUser?.rating ? currentUser.rating.toFixed(1) : 'New User'} Rating
        </div>
      </div>
      
      {/* Universal Roles Toggle */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setViewRole('generator')} 
          style={{ padding: '10px 20px', borderRadius: '5px', background: viewRole === 'generator' ? '#4CAF50' : '#ddd', color: viewRole === 'generator' ? '#fff' : '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          My Listings (Sell/Dispose)
        </button>
        <button 
          onClick={() => setViewRole('collector')} 
          style={{ padding: '10px 20px', borderRadius: '5px', background: viewRole === 'collector' ? '#2196F3' : '#ddd', color: viewRole === 'collector' ? '#fff' : '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Marketplace (Buy/Collect)
        </button>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        <Card title="Total Items" value={userListings.length} icon={<FaBoxes />} bgColor={styles.cardBgBlue} />
        <Card title="Pending" value={pendingListings.length} icon={<FaLeaf />} bgColor={styles.cardBgOrange} />
        <Card title="Completed" value={completedListings.length} icon={<FaCheckCircle />} bgColor={styles.cardBgGreen} />
      </div>

      <h2 className={styles.listingsSectionTitle}>
        {viewRole === 'generator' ? 'Your Items & Waste' : 'Available Items in Marketplace'}
      </h2>

      <div className={styles.listingsGrid}>
        {userListings.length > 0 ? (
          userListings.map(listing => (
            <div key={listing.id} className={styles.listingCard}>
              <div className={styles.listingInfo}>
                <h4 className={styles.listingTitle}>{listing.wasteType} - {listing.quantity} {listing.unit}</h4>
                {listing.itemType === 'old_item' && listing.price !== undefined && (
                  <p style={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '1.1rem', margin: '5px 0' }}>Price: ₹{listing.price}</p>
                )}
                {viewRole === 'collector' && (
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>Listed By: <strong>{getGeneratorName(listing.userId)}</strong></p>
                )}
                {viewRole === 'generator' && listing.assignedCollectorId && (
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '5px' }}>{listing.status === 'completed' ? 'Collected By' : 'Assigned To'}: <strong>{getCollectorName(listing.assignedCollectorId)}</strong></p>
                )}
                <p>Status: <span className={styles.statusBadge}>{listing.status}</span></p>
              </div>

              <div className={styles.listingActions}>
                <button onClick={() => router.push(`/map?listingId=${listing.id}`)} className={styles.viewMapButton}>
                  <FaMapMarkedAlt /> Map
                </button>

                {listing.status === 'completed' && (
                  <button 
                    onClick={() => {
                      if (viewRole === 'generator' && listing.assignedCollectorId) {
                        setRatingModal({ isOpen: true, targetUserId: listing.assignedCollectorId, targetName: getCollectorName(listing.assignedCollectorId) });
                      } else if (viewRole === 'collector') {
                        setRatingModal({ isOpen: true, targetUserId: listing.userId, targetName: getGeneratorName(listing.userId) });
                      }
                    }}
                    style={{ background: '#FFC107', color: '#000', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                     ⭐ Rate User
                  </button>
                )}

                {/* Generator Actions: Edit & Delete */}
                {viewRole === 'generator' && listing.status === 'pending' && (
                  <div className={styles.collectorActions}>
                    <button 
                      onClick={() => {
                        const newQty = prompt("Enter new quantity:", listing.quantity);
                        if (newQty) {
                          updateWasteListing?.(listing.id, { quantity: newQty });
                        }
                      }}
                      style={{ background: '#2196F3', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this listing?")) {
                          try {
                            const res = await fetch('/api/listings/delete', {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: listing.id })
                            });
                            if (res.ok) {
                              alert("Listing deleted successfully!");
                              window.location.reload();
                            } else {
                              alert("Failed to delete listing.");
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}

                {/* MARKETPLACE ACTIONS */}
                {viewRole === 'collector' && (
                  <div className={styles.collectorActions}>
                    {listing.status === 'pending' && (
                      <button 
                        onClick={() => updateWasteListing?.(listing.id, { status: 'assigned', assignedCollectorId: currentUser.id })}
                        className={styles.actionButtonAssign}
                      >
                        <FaClipboardCheck /> {listing.itemType === 'old_item' ? '🛒 Buy / Claim' : '♻️ Collect Waste'}
                      </button>
                    )}
                    {listing.status === 'assigned' && listing.assignedCollectorId === currentUser.id && (
                      <button 
                        onClick={() => updateWasteListing?.(listing.id, { status: 'completed' })}
                        className={styles.actionButtonComplete}
                      >
                        <FaCheckCircle /> Mark as {listing.itemType === 'old_item' ? 'Received' : 'Collected'}
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

      {ratingModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', color: 'black' }}>
            <h3>Rate {ratingModal.targetName}</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => handleRate(star)} style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>⭐</button>
              ))}
            </div>
            <button onClick={() => setRatingModal({ isOpen: false, targetUserId: '', targetName: '' })} style={{ padding: '5px 10px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}