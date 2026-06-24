// src/components/map/MapList.tsx
// (This component is designed to be your ListingDetailPanel)

import React, { useState, useEffect, useCallback } from "react";
import { WasteListingLocation, User, WasteStatus } from "../../types"; // Ensure types are correctly imported
import styles from "./waste-map.module.css"; // Assuming this CSS module contains styles for the detail panel
import {
  FaTimes,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaTag,
  FaInfoCircle,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaComment,
  FaCalendarAlt,
  FaCheckCircle,
  FaTruck,
  FaPlusCircle, // For adding a comment
  FaPencilAlt, // For edit action (optional, but good for completeness)
} from "react-icons/fa";
import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

interface ListingDetailPanelProps {
  listing: WasteListingLocation | null;
  currentUser: User | null; // The currently logged-in user
  users: User[] | null; // All users, to look up assigned collector's name
  onClose: () => void;
  // Function to update the listing status and potentially add comments.
  // It's expected to be provided by the parent (map/page.tsx) and interact with DataContext.
  onUpdateListingStatus: (
    listingId: string,
    newStatus: WasteStatus,
    collectorId?: string | null, // Optional: for 'assigned' status
    commentText?: string // Optional: for adding a new comment
  ) => Promise<void>;
}

const ListingDetailPanel: React.FC<ListingDetailPanelProps> = ({
  listing,
  currentUser,
  users,
  onClose,
  onUpdateListingStatus,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false); // To toggle comment input visibility

  // Reset comment input and hide it when a new listing is selected or panel is opened/closed
  useEffect(() => {
    if (listing) {
      setCommentText("");
      setShowCommentInput(false);
    }
  }, [listing]);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Add event listener when panel is open
    if (listing) {
      document.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [listing, onClose]);

  // --- Helper function to safely format dates ---
  const safeFormatDistanceToNow = (dateString: string | undefined | null) => {
    if (!dateString || typeof dateString !== "string") return "unknown time";
    const date = parseISO(dateString);
    return isValid(date) ? formatDistanceToNow(date) : "unknown time";
  };

  // Handler for assigning the listing to the current collector
  const handleAssignToMe = useCallback(async () => {
    if (!currentUser || !listing) return; // Ensure user and listing exist

    // Confirm action with the user
    const confirmAssign = window.confirm(
      "Are you sure you want to pick up/assign this item to yourself?"
    );
    if (confirmAssign) {
      try {
        // Call the parent's update function to change status to 'assigned' and set collector ID
        await onUpdateListingStatus(
          listing.id,
          "assigned",
          currentUser.id, // Assign current user's ID
          `Listing assigned to ${currentUser.displayName || currentUser.email}.` // Auto-add comment
        );
        // After successful update, you might want to provide feedback (e.g., a toast notification)
        // The parent (MapPage) will re-render and close this panel if selectedListing becomes null.
      } catch (error) {
        console.error("Failed to assign listing:", error);
        alert("Failed to assign listing. Please try again.");
      }
    }
  }, [currentUser, listing, onUpdateListingStatus]); // Dependencies for useCallback

  // Handler for marking the listing as completed
  const handleMarkAsCompleted = useCallback(async () => {
    if (!listing) return; // Ensure listing exists

    // Confirm action with the user
    const confirmComplete = window.confirm(
      "Are you sure you want to mark this item as 'completed'? This action cannot be undone."
    );
    if (confirmComplete) {
      try {
        // Call the parent's update function to change status to 'completed'
        await onUpdateListingStatus(
          listing.id,
          "completed",
          null, // Clear assigned collector if design requires this on completion
          `Listing marked as completed by ${
            currentUser?.displayName || currentUser?.email
          }.` // Auto-add comment
        );
        // Provide feedback
      } catch (error) {
        console.error("Failed to mark as completed:", error);
        alert("Failed to mark as completed. Please try again.");
      }
    }
  }, [listing, currentUser, onUpdateListingStatus]); // Dependencies for useCallback

  // Handler for adding a new comment
  const handleAddComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault(); // Prevent default form submission
      if (!listing || !commentText.trim()) return; // Don't submit empty comments

      setIsSubmittingComment(true); // Set loading state for button
      try {
        // Use the general update function to add a comment without changing status
        await onUpdateListingStatus(
          listing.id,
          listing.status, // Keep current status
          listing.assignedCollectorId, // Keep current assigned collector
          commentText // Pass the new comment text
        );
        setCommentText(""); // Clear comment input
        setShowCommentInput(false); // Hide input after success
      } catch (error) {
        console.error("Failed to add comment:", error);
        alert("Failed to add comment. Please try again.");
      } finally {
        setIsSubmittingComment(false); // Reset loading state
      }
    },
    [listing, commentText, onUpdateListingStatus]
  ); // Dependencies for useCallback

  // Logic to determine if "Pick Up/Assign" button should be shown
  const canAssign =
    listing?.status === "pending" && listing?.userId !== currentUser?.id; // Don't allow lister to assign to themselves

  // Logic to determine if "Mark as Completed" button should be shown
  const canComplete =
    listing?.status !== "completed" &&
    (listing?.assignedCollectorId === currentUser?.id || listing?.userId === currentUser?.id);

  const isOldItem = listing?.itemType === "old_item";
  const assignButtonText = isOldItem ? "Buy / Claim Item" : "Pick Up / Assign to Me";
  const completeButtonText = isOldItem ? "Mark as Sold" : "Mark as Collected";

  // Logic to determine if the contact button should be shown (not for the lister themselves)
  const showContactLister =
    listing?.contactInfo && currentUser?.id !== listing?.userId;

  // Prepare contact info for display or button action
  const contactDetails = [];
  if (listing?.contactInfo?.phone) {
    contactDetails.push({
      icon: <FaPhone />,
      text: listing.contactInfo.phone,
      type: "phone",
    });
  }
  if (listing?.contactInfo?.email) {
    contactDetails.push({
      icon: <FaEnvelope />,
      text: listing.contactInfo.email,
      type: "email",
    });
  }

  // Find the assigned collector's display name for display purposes
  const assignedCollector = listing?.assignedCollectorId
    ? users?.find((user) => user.id === listing.assignedCollectorId)
    : null;

  // Now do the early return
  if (!listing) return null;

  return (
    <div 
      className={styles.detailPanelOverlay}
      onClick={onClose} // Close when clicking on overlay
    >
      <div 
        className={styles.detailPanel}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
      >
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onClose();
          }}
          type="button"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Title */}
        <h2 className={styles.detailPanelTitle}>{listing.wasteType}</h2>

        {/* Image */}
        {listing.imageUrl && (
          <div className={styles.detailPanelImageContainer}>
            <img
              src={listing.imageUrl}
              alt={listing.wasteType}
              className={styles.detailPanelImage}
            />
          </div>
        )}

        {/* Details Section */}
        <div className={styles.detailSection}>
          <div className={styles.detailItem}>
            <FaInfoCircle className={styles.detailIcon} />
            <strong>Description:</strong>{" "}
            <span>{listing.description || "N/A"}</span>
          </div>
          <div className={styles.detailItem}>
            <FaMapMarkerAlt className={styles.detailIcon} />
            <strong>Location:</strong>{" "}
            <span>
              {listing.location.address || listing.location.city || "Unknown"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <FaRulerCombined className={styles.detailIcon} />
            <strong>Quantity:</strong>{" "}
            <span>
              {listing.quantity} {listing.unit}
            </span>
          </div>
          {listing.itemType === "old_item" &&
            listing.price !== undefined && ( // Check for undefined price explicitly
              <div className={styles.detailItem}>
                <FaTag className={styles.detailIcon} />
                <strong>Price:</strong> <span>₹{listing.price}</span>
              </div>
            )}
          <div className={styles.detailItem}>
            <FaClock className={styles.detailIcon} />
            <strong>Listed:</strong>{" "}
            <span>{safeFormatDistanceToNow(listing.createdAt)} ago</span>
          </div>
          <div className={styles.detailItem}>
            <FaClock className={styles.detailIcon} />
            <strong>Status:</strong>
            <span
              className={`${styles.detailStatus} ${
                styles[
                  `status${
                    listing.status.charAt(0).toUpperCase() +
                    listing.status.slice(1)
                  }`
                ]
              }`}
            >
              {listing.status}
            </span>
          </div>
          {listing.assignedCollectorId && (
            <div className={styles.detailItem}>
              <FaTruck className={styles.detailIcon} />
              <strong>Assigned To:</strong>{" "}
              <span>
                {assignedCollector?.displayName ||
                  assignedCollector?.email ||
                  "Unknown Collector"}
              </span>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className={styles.commentsSection}>
          <h3
            className={styles.commentsTitle}
            onClick={() => setShowCommentInput((prev) => !prev)}
          >
            <FaComment className={styles.commentsIcon} /> Comments (
            {listing.comments?.length || 0})
            <FaPencilAlt
              style={{
                marginLeft: "10px",
                fontSize: "0.8em",
                cursor: "pointer",
              }}
            />
          </h3>
          <div className={styles.commentList}>
            {listing.comments && listing.comments.length > 0 ? (
              [...listing.comments]
                .filter((comment) => {
                  if (
                    !comment.createdAt ||
                    typeof comment.createdAt !== "string"
                  )
                    return false;
                  const commentDate = parseISO(comment.createdAt);
                  return isValid(commentDate);
                })
                .sort(
                  (a, b) =>
                    parseISO(b.createdAt).getTime() -
                    parseISO(a.createdAt).getTime()
                )
                .map((comment) => (
                  <div
                    key={comment.id || comment.createdAt}
                    className={styles.commentItem}
                  >
                    <div className={styles.commentHeader}>
                      <strong>{comment.userName}</strong>
                      <span className={styles.commentTime}>
                        <FaCalendarAlt />{" "}
                        {safeFormatDistanceToNow(comment.createdAt)} ago
                      </span>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                ))
            ) : (
              <p className={styles.noCommentsMessage}>No comments yet.</p>
            )}
          </div>
          {showCommentInput && (
            <form onSubmit={handleAddComment} className={styles.addCommentForm}>
              <textarea
                className={styles.commentInput}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                disabled={isSubmittingComment}
              ></textarea>
              <button
                type="submit"
                className={styles.addCommentButton}
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? "Adding..." : "Add Comment"}
              </button>
            </form>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.detailActions}>
          {canAssign && (
            <button
              className={styles.actionButtonAssign}
              onClick={handleAssignToMe}
              disabled={!currentUser}
            >
              <FaTruck /> {assignButtonText}
            </button>
          )}
          {canComplete && (
            <button
              className={styles.actionButtonComplete}
              onClick={handleMarkAsCompleted}
              disabled={!currentUser}
            >
              <FaCheckCircle /> {completeButtonText}
            </button>
          )}
          {showContactLister && (
            <button
              className={styles.actionButtonContactSeller}
              onClick={() => {
                if (listing.contactInfo?.phone) {
                  window.open(`tel:${listing.contactInfo.phone}`);
                } else if (listing.contactInfo?.email) {
                  window.open(`mailto:${listing.contactInfo.email}`);
                } else {
                  alert("No contact information available.");
                }
              }}
            >
              <FaUser /> Contact Lister
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPanel;