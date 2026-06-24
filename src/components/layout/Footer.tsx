'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer completely on the map page for a better full-screen experience
  if (pathname === '/map') {
    return null;
  }

  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '3rem 1rem 1rem 1rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
        
        {/* Mission Statement Column */}
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#4CAF50' }}>About Us</h3>
          <p style={{ lineHeight: '1.6', opacity: 0.9, fontSize: '0.9rem', marginBottom: '1rem' }}>
            Our motive is to create a cleaner, greener India by connecting waste generators directly with responsible collectors and buyers. Together, we can transform waste into wealth, promote a circular economy, and build a sustainable future for the next generation. Join the Smart Waste Swaraj movement today!
          </p>
          <Link href="/about" style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Read more &rarr;</Link>
        </div>

        {/* Quick Links Column */}
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#4CAF50' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link href="/" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>Home</Link></li>
            <li><Link href="/about" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>About Us</Link></li>
            <li><Link href="/map" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>Waste Map</Link></li>
            <li><Link href="/learn" style={{ color: '#fff', opacity: 0.8, textDecoration: 'none' }}>Learn More</Link></li>
          </ul>
        </div>

        {/* Contact Us Form Column */}
        <div style={{ flex: '1 1 350px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#4CAF50' }}>Contact Us</h3>
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              
              try {
                const response = await fetch("https://formsubmit.co/ajax/shatabdiexpresspri@gmail.com", {
                  method: "POST",
                  body: formData,
                });
                
                if (response.ok) {
                  alert("Message Sent Successfully! We will get back to you soon.");
                  form.reset();
                } else {
                  alert("Oops! Something went wrong. Please try again.");
                }
              } catch {
                alert("Error sending message. Please check your network connection.");
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
          >
            {/* Disable captcha for seamless experience (optional) */}
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_subject" value="New Query from Smart Waste Swaraj!" />
            
            <input type="text" name="name" placeholder="Your Name" required style={{ padding: '0.6rem', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: '#fff' }} />
            <input type="email" name="email" placeholder="Your Email" required style={{ padding: '0.6rem', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: '#fff' }} />
            <textarea name="query" placeholder="Your Query" required rows={3} style={{ padding: '0.6rem', borderRadius: '6px', border: 'none', backgroundColor: '#333', color: '#fff', resize: 'vertical' }}></textarea>
            <button type="submit" style={{ padding: '0.8rem', borderRadius: '6px', border: 'none', backgroundColor: '#4CAF50', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>Send Message</button>
          </form>
        </div>

      </div>
      
      {/* Copyright */}
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #333', opacity: 0.6, fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} Smart Waste Swaraj. All rights reserved.
      </div>
    </footer>
  );
}
