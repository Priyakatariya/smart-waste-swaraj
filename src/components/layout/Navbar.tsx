// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection
import { useData } from '@/contexts/DataContext';
import {
  FaBars,
  FaTimes,
  FaHome,
  FaTachometerAlt,
  FaMapMarkedAlt,
  FaPlusCircle, // Add Waste icon
  FaBookOpen,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle, // User profile icon (if you want to use it later)
  FaLeaf
} from 'react-icons/fa';

import styles from './navbar.module.css';

export default function Navbar() {
  const {  user:currentUser, logout } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter(); // Initialize useRouter hook

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false); // Close mobile menu when a link is clicked
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  // Handle click on "Add Waste" link: redirect to login if not authenticated
  const handleAddWasteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!currentUser) {
      e.preventDefault(); // Prevent default link behavior
      // Redirect to login page, with a 'redirect' query parameter to return after login
      router.push('/auth/login?redirect=/add-waste');
      setIsMobileMenuOpen(false); // Close menu
    } else {
      handleNavLinkClick(); // If logged in, proceed and close mobile menu
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo and Site Title */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: '#fff', whiteSpace: 'nowrap' }} onClick={handleNavLinkClick}>
          <div style={{ backgroundColor: '#fff', color: '#4CAF50', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <FaLeaf />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '0.5px' }}>Smart Waste Swaraj</span>
        </Link>

        {/* Mobile Menu Toggle Button (Hamburger/X icon) */}
        <div className={styles.menuToggle} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Navigation Links - Dynamically apply 'active' class for mobile */}
        <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
          <Link href="/" className={styles.navLink} onClick={handleNavLinkClick}>
            <FaHome className={styles.navIcon} /> Home
          </Link>
          <Link href="/dashboard" className={styles.navLink} onClick={handleNavLinkClick}>
            <FaTachometerAlt className={styles.navIcon} /> Dashboard
          </Link>
          <Link href="/map" className={styles.navLink} onClick={handleNavLinkClick}>
            <FaMapMarkedAlt className={styles.navIcon} /> Waste Map
          </Link>
          {/* "Add Waste" link: visible to all, but requires login for access */}
          <Link href="/list-waste" className={styles.navLink} onClick={handleAddWasteClick}>
            <FaPlusCircle className={styles.navIcon} /> Add Waste
          </Link>
          <Link href="/learn" className={styles.navLink} onClick={handleNavLinkClick}>
            <FaBookOpen className={styles.navIcon} /> Learn
          </Link>

          {/* Conditional rendering for Login/Signup or Logout button */}
          <div className={styles.profileSection}>
            {currentUser ? (
              // User is logged in - Profile Dropdown
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div 
                  style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', color: '#4CAF50', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', 
                    fontSize: '1.2rem', cursor: 'pointer', border: '2px solid #e8f5e9', textTransform: 'uppercase'
                  }}
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling as HTMLElement;
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                  }}
                >
                  {(currentUser.name || currentUser.email).charAt(0)}
                </div>
                
                <div 
                  style={{ 
                    display: 'none', position: 'absolute', top: '50px', right: '0', backgroundColor: '#fff', 
                    color: '#333', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    padding: '1rem', minWidth: '200px', zIndex: 1000 
                  }}
                >
                  <div style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{currentUser.name || currentUser.email.split('@')[0]}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{currentUser.email}</div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    style={{ 
                      width: '100%', padding: '0.6rem', textAlign: 'left', backgroundColor: 'transparent', 
                      border: 'none', color: '#d32f2f', fontWeight: 'bold', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '0.5rem' 
                    }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            ) : (
              // User is not logged in
              <>
                <Link href="/auth/login" className={`${styles.authButton} ${styles.navLink}`} onClick={handleNavLinkClick}>
                  <FaSignInAlt className={styles.navIcon} /> Login
                </Link>
                <Link href="/auth/signup" className={`${styles.authButton} ${styles.navLink}`} onClick={handleNavLinkClick}>
                  <FaUserPlus className={styles.navIcon} /> Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}