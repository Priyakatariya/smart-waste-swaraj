import Link from 'next/link';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '80vh', backgroundColor: '#f9fbf9', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Header Area */}
        <div style={{ backgroundColor: '#4CAF50', padding: '4rem 2rem', textAlign: 'center', color: '#fff' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>About Smart Waste Swaraj</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Empowering communities to turn waste into wealth through a digital circular economy.
          </p>
        </div>

        {/* Content Area */}
        <div style={{ padding: '3rem', lineHeight: '1.8', color: '#444', fontSize: '1.1rem' }}>
          <h2 style={{ color: '#2E7D32', fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '3px solid #e8f5e9', paddingBottom: '0.5rem', display: 'inline-block' }}>
            Our Mission
          </h2>
          <p style={{ marginBottom: '2rem' }}>
            Our motive is to create a cleaner, greener India by connecting waste generators directly with responsible collectors and buyers. Together, we can transform waste into wealth, promote a circular economy, and build a sustainable future for the next generation. Join the Smart Waste Swaraj movement today!
          </p>

          <h2 style={{ color: '#2E7D32', fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '3px solid #e8f5e9', paddingBottom: '0.5rem', display: 'inline-block', marginTop: '1rem' }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#f1f8e9', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ color: '#33691E', fontWeight: 'bold', marginBottom: '0.5rem' }}>1. List Waste</h3>
              <p style={{ fontSize: '0.95rem' }}>Post your segregated dry waste or old items easily on our platform.</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#e8f5e9', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ color: '#33691E', fontWeight: 'bold', marginBottom: '0.5rem' }}>2. Connect</h3>
              <p style={{ fontSize: '0.95rem' }}>Local collectors and buyers see your listing on the Waste Map and contact you.</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#c8e6c9', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>♻️</div>
              <h3 style={{ color: '#33691E', fontWeight: 'bold', marginBottom: '0.5rem' }}>3. Recycle</h3>
              <p style={{ fontSize: '0.95rem' }}>Items are picked up, recycled, or upcycled, saving them from landfills.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <Link 
              href="/list-waste" 
              style={{ display: 'inline-block', padding: '1rem 2.5rem', backgroundColor: '#4CAF50', color: '#fff', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', transition: 'transform 0.2s' }}
            >
              Get Started Today
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}