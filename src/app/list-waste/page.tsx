// src/app/list-waste/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { WasteListing, LocationData, ItemType, WasteCategory } from '../../types';
import { FaPlusCircle, FaMapMarkerAlt, FaSpinner, FaTimesCircle, FaUpload, FaMoneyBillWave, FaTrash, FaBoxOpen } from 'react-icons/fa';
import styles from './list-waste.module.css'; // NEW: Import module CSS for this page

export default function ListWastePage() {
  const {  user :currentUser, loading: dataContextLoading, createWasteListing } = useData();
  const router = useRouter();

  const [wasteType, setWasteType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg'); // Default unit
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');

  // New states for extended features
  const [itemType, setItemType] = useState<ItemType | ''>(''); // 'waste' or 'old_item'
  const [wasteCategory, setWasteCategory] = useState<WasteCategory | ''>(''); // Specific waste category
  const [imageUrl, setImageUrl] = useState(''); // Simulated image URL
  const [price, setPrice] = useState<number | ''>(''); // For 'old_item'

  useEffect(() => {
    if (!dataContextLoading && !currentUser) {
      router.push('/auth/login');
    }
  }, [currentUser, dataContextLoading, router]);

  const fetchCurrentLocation = () => {
    setErrorMessage('');
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please enter location manually.');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('fetching');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let addressStr = 'Fetching address...';
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: addressStr 
        });
        setLocationStatus('success');
        setErrorMessage('');

        // Reverse geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setLocation(prev => prev ? { ...prev, address: data.display_name } : null);
            }
          }
        } catch (e) {
          console.error('Reverse geocoding failed', e);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        let msg = 'Unable to retrieve your location. ';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED: msg += 'Please grant location access.'; break;
          case geoError.POSITION_UNAVAILABLE: msg += 'Location information is unavailable.'; break;
          case geoError.TIMEOUT: msg += 'The request to get user location timed out.'; break;
          default: msg += 'An unknown error occurred.';
        }
        setErrorMessage(msg);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleClearLocation = () => {
    setLocation(null);
    setLocationStatus('idle');
    setErrorMessage('');
  };

  // Simulated image upload - in a real app, this would handle file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // For hackathon, just simulate a placeholder image URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          // In a real app, you'd upload this file to a service (e.g., Firebase Storage)
          // and get a permanent URL. For now, we use a generic placeholder.
          setImageUrl(`https://placehold.co/400x300/e0e0e0/555555?text=Your+Image+Uploaded`);
          // Or, to show the specific image, you would use event.target.result as a data URL,
          // but that can be large and isn't a permanent solution.
          // setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  const handleAutoCategorize = () => {
    if (!description && !wasteType) {
      setErrorMessage('Please provide a description or a basic item name for the AI to analyze.');
      return;
    }
    
    setErrorMessage('');
    
    // Smart Keyword Analysis
    const textToAnalyze = `${description} ${wasteType}`.toLowerCase();
    
    let detectedCategory: WasteCategory = 'other';
    let detectedItemType: ItemType = 'waste';
    let detectedName = wasteType || 'Auto-detected Item';
    let detectedQty = quantity || '1';
    let detectedUnit = unit || 'kg';

    // 1. Detect Item Type & Category based on keywords
    if (textToAnalyze.match(/(furniture|chair|table|sofa|bed|shelf|desk|clothing|shirt|pant|shoes|toy|book|appliance)/)) {
      detectedItemType = 'old_item';
    } else if (textToAnalyze.match(/(phone|laptop|cable|wire|battery|electronic|tv|monitor|computer|keyboard|mouse|circuit|screen)/)) {
      detectedItemType = 'waste';
      detectedCategory = 'e_waste';
    } else if (textToAnalyze.match(/(plastic|bottle|bag|wrapper|polythene|container|pvc|pet)/)) {
      detectedCategory = 'recyclable_plastic';
    } else if (textToAnalyze.match(/(paper|cardboard|box|newspaper|magazine|carton)/)) {
      detectedCategory = 'recyclable_paper';
    } else if (textToAnalyze.match(/(can|tin|metal|iron|steel|aluminum|copper)/)) {
      detectedCategory = 'recyclable_metal';
    } else if (textToAnalyze.match(/(food|peel|organic|vegetable|fruit|leaf|leaves|grass|wet|kitchen)/)) {
      detectedCategory = 'biodegradable';
    } else if (textToAnalyze.match(/(chemical|paint|acid|medical|syringe|oil|toxic)/)) {
      detectedCategory = 'hazardous';
    } else if (textToAnalyze.match(/(mixed|dry|trash)/)) {
      detectedCategory = 'non_biodegradable';
    }

    // 2. Try to extract quantity and unit from text (e.g. "5 kg", "2 bags")
    const qtyMatch = textToAnalyze.match(/(\d+)\s*(kg|grams|liters|pieces|bags|units|boxes)/i);
    if (qtyMatch) {
      detectedQty = qtyMatch[1];
      detectedUnit = qtyMatch[2].toLowerCase();
    } else {
      // Just extract any standalone number
      const numMatch = textToAnalyze.match(/(\d+)/);
      if (numMatch) detectedQty = numMatch[1];
    }

    // 3. Extract a name if wasteType is empty
    if (!wasteType) {
      if (detectedItemType === 'old_item') detectedName = 'Auto-detected Reusable Item';
      else detectedName = `Auto-detected ${detectedCategory.replace('_', ' ')}`;
    }

    setTimeout(() => {
      setItemType(detectedItemType);
      if (detectedItemType === 'waste') {
        setWasteCategory(detectedCategory);
      } else {
        setWasteCategory(''); // Not applicable for old items
        if (!price) setPrice(0); // Suggest 0 (donation) or let them edit
      }
      setWasteType(detectedName);
      setQuantity(detectedQty);
      setUnit(detectedUnit);
      alert(`🤖 Smart AI analyzed your input:\nType: ${detectedItemType === 'old_item' ? 'Old Item' : 'Waste'}\nCategory: ${detectedCategory.replace('_', ' ')}\nQuantity: ${detectedQty} ${detectedUnit}`);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage('You must be logged in to list waste.');
      router.push('/auth/login');
      return;
    }
    if (!itemType) {
      setErrorMessage('Please select whether you are listing waste or an old item.');
      return;
    }
    if (itemType === 'waste' && !wasteCategory) {
      setErrorMessage('Please select a waste category.');
      return;
    }
    if (!location) {
      setErrorMessage('Please provide a location for the listing.');
      return;
    }
    if (!wasteType.trim() || !quantity.trim()) {
      setErrorMessage('Type and Quantity are required.');
      return;
    }
    if (itemType === 'old_item' && price === '') {
      setErrorMessage('Price is required for old items.');
      return;
    }

    setIsSubmitting(true);

    const newListing: Omit<WasteListing, 'id' | 'createdAt' | 'status' | 'assignedCollectorId' | 'completedAt' | 'comments'> = {
      userId: currentUser.id,
      wasteType,
      quantity,
      unit,
      description: description.trim(),
      location: location,
      itemType,
      wasteCategory: itemType === 'waste' && wasteCategory !== '' ? wasteCategory : undefined, // Only set category if itemType is 'waste' and selected
      imageUrl: imageUrl || undefined, // Only include if provided
      price: itemType === 'old_item' && price !== '' ? Number(price) : undefined, // Only for old items
    };

    try {
      await createWasteListing(newListing);
      console.log('Listing created successfully!');
      router.push('/dashboard'); // Redirect to dashboard after successful listing
    } catch (submitError) {
      console.error('Failed to create listing:', submitError);
      setErrorMessage('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (dataContextLoading || (!currentUser && !dataContextLoading)) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.listWasteContainer}>
      <h1 className={styles.listWasteTitle}>List New Item</h1>
      <p className={styles.listWasteSubtitle}>Help keep India clean by listing your waste for collection, or find a new home for your old items!</p>

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Item Type Selection */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>What are you listing?</label>
          <div className={styles.itemTypeSelection}>
            <button
              type="button"
              className={`${styles.itemTypeButton} ${itemType === 'waste' ? styles.activeItemType : ''}`}
              onClick={() => setItemType('waste')}
            >
              <FaTrash className={styles.buttonIcon} /> Waste for Collection
            </button>
            <button
              type="button"
              className={`${styles.itemTypeButton} ${itemType === 'old_item' ? styles.activeItemType : ''}`}
              onClick={() => setItemType('old_item')}
            >
              <FaBoxOpen className={styles.buttonIcon} /> Old Item to Sell/Donate
            </button>
          </div>
          {!itemType && <p className={styles.inputHint}>Please select one.</p>}
        </div>

        {itemType === 'waste' && (
          <div className={styles.formGroup}>
            <label htmlFor="wasteCategory" className={styles.formLabel}>Waste Category</label>
            <select
              id="wasteCategory"
              className={styles.formSelect}
              value={wasteCategory}
              onChange={(e) => setWasteCategory(e.target.value as WasteCategory)}
              required
            >
              <option value="">Select a category</option>
              <option value="biodegradable">Biodegradable (Wet Waste)</option>
              <option value="non_biodegradable">Non-Biodegradable (Mixed Dry Waste)</option>
              <option value="recyclable_plastic">Recyclable Plastic</option>
              <option value="recyclable_paper">Recyclable Paper/Cardboard</option>
              <option value="recyclable_metal">Recyclable Metal</option>
              <option value="e_waste">E-Waste</option>
              <option value="hazardous">Hazardous (Batteries, Chemicals)</option>
              <option value="other">Other Waste</option>
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="wasteType" className={styles.formLabel}>{itemType === 'old_item' ? 'Item Name' : 'Waste Type'}</label>
          <input
            type="text"
            id="wasteType"
            className={styles.formInput}
            placeholder={itemType === 'old_item' ? 'e.g., Old Books, Furniture, Electronics' : 'e.g., Plastic Bottles, Organic Waste'}
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quantity" className={styles.formLabel}>Quantity</label>
          <div className={styles.quantityInputGroup}>
            <input
              type="text"
              id="quantity"
              className={styles.formInput}
              placeholder="e.g., 5, 200"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <select
              id="unit"
              className={styles.formSelectUnit}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="kg">kg</option>
              <option value="grams">grams</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
              <option value="bags">bags</option>
              <option value="units">units</option>
              <option value="boxes">boxes</option>
            </select>
          </div>
        </div>

        {itemType === 'old_item' && (
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.formLabel}>Price (₹) <span className={styles.optionalText}>(Leave blank if donating)</span></label>
            <div className={styles.priceInputGroup}>
              <span className={styles.priceCurrency}>₹</span>
              <input
                type="number"
                id="price"
                className={styles.formInput}
                placeholder="e.g., 500"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || '')}
              />
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.formLabel}>Description (Optional)</label>
          <textarea
            id="description"
            className={styles.formTextarea}
            rows={3}
            placeholder={itemType === 'old_item' ? 'Details about the item (condition, dimensions, etc.)' : 'Specific details about the waste (e.g., mixed, soiled, fragile)'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className={styles.formGroup}>
          <label htmlFor="imageUrl" className={styles.formLabel}>Upload Photo (Optional)</label>
          <input
            type="file"
            id="imageUrl"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleImageUpload}
          />
          {imageUrl && (
            <div className={styles.imagePreviewContainer}>
              <img src={imageUrl} alt="Uploaded Preview" className={styles.imagePreview} />
              <button type="button" className={styles.removeImageButton} onClick={() => setImageUrl('')}>
                <FaTimesCircle /> Remove Image
              </button>
            </div>
          )}
          {!imageUrl && (
            <p className={styles.inputHint}>
              <FaUpload /> Upload a clear photo of the waste/item.
            </p>
          )}

          {/* AI Mock Auto-Categorize Button */}
          <button 
            type="button" 
            onClick={handleAutoCategorize} 
            style={{ marginTop: '10px', background: '#9c27b0', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
          >
            ✨ Auto-Categorize with AI
          </button>
        </div>


        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Location</label>
          {!location ? (
            <button
              type="button"
              onClick={fetchCurrentLocation}
              className={styles.locationButton}
              disabled={locationStatus === 'fetching'}
            >
              {locationStatus === 'fetching' ? (
                <>
                  <FaSpinner className={styles.spinner} /> Fetching Location...
                </>
              ) : (
                <>
                  <FaMapMarkerAlt className={styles.buttonIcon} /> Use Current Location
                </>
              )}
            </button>
          ) : (
            <div className={styles.locationInfoBox}>
              <FaMapMarkerAlt className={styles.buttonIcon} />
              <span>
                Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                {location.address && `, ${location.address}`}
              </span>
              <button type="button" onClick={handleClearLocation} className={styles.locationClearButton}>
                <FaTimesCircle className={styles.buttonIcon} /> Clear
              </button>
            </div>
          )}
          {locationStatus === 'error' && (
            <p className={styles.errorMessageText}>{errorMessage}</p>
          )}
        </div>

        {errorMessage && locationStatus !== 'error' && (
          <p className={styles.errorMessageText}>{errorMessage}</p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || !location || !wasteType.trim() || !quantity.trim() || !itemType || (itemType === 'waste' && !wasteCategory) || (itemType === 'old_item' && price === '')}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className={styles.spinner} /> Submitting...
            </>
          ) : (
            <>
              <FaPlusCircle className={styles.buttonIcon} /> List Item
            </>
          )}
        </button>
      </form>
    </div>
  );
}