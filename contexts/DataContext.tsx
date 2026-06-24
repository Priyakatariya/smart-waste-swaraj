'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'generator' | 'collector';
}

interface DataContextType {
  user: User | null;
  users: User[]; 
  loading: boolean;
  wasteListings: any[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: any) => Promise<boolean>;
  logout: () => void;
  createWasteListing: (data: any) => Promise<void>;
  updateWasteListing: (id: string, fields: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [wasteListings, setWasteListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch listings
      const listingsRes = await fetch('/api/listings');
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setWasteListings(listingsData);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('sws_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      
      await fetchData();
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('sws_user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const signup = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return res.ok;
    } catch (error) {
      return false;
    }
  };

  const createWasteListing = async (listingData: any) => {
    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });
      
      if (res.ok) {
        const data = await res.json();
        // Immediately add the new listing to the UI
        setWasteListings(prev => [data.listing, ...prev]);
      } else {
        throw new Error("Failed to create listing");
      }
    } catch (error) {
      console.error("Create listing failed", error);
      throw error;
    }
  };

  const updateWasteListing = async (id: string, fields: any) => {
    try {
      const res = await fetch('/api/listings/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields }),
      });

      if (res.ok) {
        const data = await res.json();
        // Local state update taaki UI pe turant dikhe
        setWasteListings(prev => 
          prev.map(l => l.id === id ? { ...l, ...fields, ...data.listing } : l)
        );
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sws_user');
  };

  return (
    <DataContext.Provider value={{ 
      user, 
      users, 
      loading, 
      wasteListings, 
      login, 
      signup, 
      logout, 
      createWasteListing,
      updateWasteListing 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};