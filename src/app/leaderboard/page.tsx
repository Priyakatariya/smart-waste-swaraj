import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import styles from '../dashboard/dashboard.module.css'; // Reusing some card styles
import Link from 'next/link';

export const revalidate = 60; // Revalidate every minute

export default async function LeaderboardPage() {
  await connectToDB();

  // Fetch top 50 users sorted by swarajPoints descending
  const topUsers = await User.find({ swarajPoints: { $gt: 0 } })
    .sort({ swarajPoints: -1 })
    .limit(50)
    .lean();

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#4CAF50' }}>🏆 Swaraj Leaderboard</h1>
        <Link href="/dashboard" style={{ textDecoration: 'underline', color: '#fff' }}>Back to Dashboard</Link>
      </div>
      
      <p style={{ marginBottom: '30px', fontSize: '1.2rem', color: '#ccc' }}>
        Top eco-warriors based on recycling activity and completed pickups.
      </p>

      <div style={{ background: '#222', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#333', textAlign: 'left' }}>
              <th style={{ padding: '15px', borderBottom: '1px solid #444' }}>Rank</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #444' }}>Name</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #444' }}>Role</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #444' }}>Points</th>
              <th style={{ padding: '15px', borderBottom: '1px solid #444' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.length > 0 ? topUsers.map((user: any, index) => (
              <tr key={user._id.toString()} style={{ borderBottom: '1px solid #444', transition: 'background 0.2s' }}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: index < 3 ? '#FFD700' : '#fff' }}>#{index + 1}</td>
                <td style={{ padding: '15px' }}>{user.name}</td>
                <td style={{ padding: '15px', textTransform: 'capitalize' }}>{user.userType}</td>
                <td style={{ padding: '15px', color: '#4CAF50', fontWeight: 'bold' }}>{user.swarajPoints} pts</td>
                <td style={{ padding: '15px' }}>{user.rating ? `${user.rating.toFixed(1)} ⭐` : 'New'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>No users have earned points yet. Start recycling!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
