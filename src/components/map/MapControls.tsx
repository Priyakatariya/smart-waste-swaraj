// src/components/map/MapControls.tsx
'use client';

import React, { useState } from 'react';
import { FaSearch, FaFilter, FaPlus, FaSeedling, FaTrash, FaLaptopMedical, FaExclamationTriangle, FaRecycle, FaMoneyBillWave } from 'react-icons/fa';
import styles from './waste-map.module.css'; // Uses waste-map.module.css for its own styles
import { ItemType, WasteCategory } from '../../types'; // Ensure correct types are imported

interface MapControlsProps {
  onSearch: (term: string) => void;
  onFilterCategory: (category: WasteCategory | ItemType | 'all') => void;
  selectedFilter: WasteCategory | ItemType | 'all';
  onListNewWaste: () => void;
}

export default function MapControls({ onSearch, onFilterCategory, selectedFilter, onListNewWaste }: MapControlsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // Pass the search term up to the parent (MapPage)
  };

  return (
    <div className={styles.mapControls}>
      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by waste type, description, or address..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('all')}
        >
          <FaFilter className={styles.filterIcon} /> All Listings
        </button>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'biodegradable' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('biodegradable')}
        >
          <FaSeedling className={styles.filterIcon} /> Biodegradable
        </button>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'non_biodegradable' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('non_biodegradable')}
        >
          <FaTrash className={styles.filterIcon} /> Non-Bio Waste
        </button>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'recyclable_plastic' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('recyclable_plastic')}
        >
          <FaRecycle className={styles.filterIcon} /> Recyclables
        </button>
         <button
          className={`${styles.filterButton} ${selectedFilter === 'e_waste' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('e_waste')}
        >
          <FaLaptopMedical className={styles.filterIcon} /> E-Waste
        </button>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'hazardous' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('hazardous')}
        >
          <FaExclamationTriangle className={styles.filterIcon} /> Hazardous
        </button>
        <button
          className={`${styles.filterButton} ${selectedFilter === 'old_item' ? styles.activeFilter : ''}`}
          onClick={() => onFilterCategory('old_item')}
        >
          <FaMoneyBillWave className={styles.filterIcon} /> Old Items
        </button>
      </div>

      <button className={styles.listWasteButton} onClick={onListNewWaste}>
        <FaPlus className={styles.buttonIcon} /> List New Waste / Item
      </button>
    </div>
  );
}