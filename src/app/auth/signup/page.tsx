'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaLock, FaUserTag, FaUserPlus, FaSpinner } from 'react-icons/fa';
import { useData } from '@/contexts/DataContext';
import styles from './signup.module.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'generator' | 'collector'>('generator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // TypeScript now knows 'password' is valid here
      const success = await signup({ name, email, password, userType });
      if (success) {
        router.push('/auth/login');
      } else {
        setError('Failed to create account. Email might already be in use.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupPageContainer}>
      <div className={styles.signupCard}>
        <h1 className={styles.cardTitle}>Join Smart Waste Swaraj</h1>
        <p className={styles.cardSubtitle}>Create your account to start making an impact.</p>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <div className={styles.inputGroup}>
            <FaUser className={styles.inputIcon} />
            <input type="text" placeholder="Your Full Name" className={styles.inputField} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <FaEnvelope className={styles.inputIcon} />
            <input type="email" placeholder="Your Email" className={styles.inputField} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input type="password" placeholder="Password" className={styles.inputField} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <FaLock className={styles.inputIcon} />
            <input type="password" placeholder="Confirm Password" className={styles.inputField} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <div className={styles.userTypeSelection}>
            <label className={styles.userTypeLabel}>
              <input type="radio" name="userType" value="generator" checked={userType === 'generator'} onChange={() => setUserType('generator')} className={styles.radioInput} />
              <span className={styles.radioCustom}></span>
              <FaUserTag className={styles.radioIcon} /> Waste Generator
            </label>
            <label className={styles.userTypeLabel}>
              <input type="radio" name="userType" value="collector" checked={userType === 'collector'} onChange={() => setUserType('collector')} className={styles.radioInput} />
              <span className={styles.radioCustom}></span>
              <FaUserTag className={styles.radioIcon} /> Waste Collector
            </label>
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? <FaSpinner className={styles.loadingSpinner} /> : <FaUserPlus className={styles.buttonIcon} />}
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className={styles.loginPrompt}>Already have an account? <Link href="/auth/login" className={styles.loginLink}>Login Here</Link></p>
      </div>
    </div>
  );
}