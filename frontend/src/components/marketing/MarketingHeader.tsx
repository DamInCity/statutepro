'use client';

import Link from 'next/link';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/lib/theme/ThemeContext';
import styles from './Marketing.module.css';

export default function MarketingHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.topNav}>
      <div className={styles.topNavInner}>
        <Link href="/" className={styles.brand}>StatutePro</Link>

        <nav className={styles.navLinks} aria-label="Primary">
          <Link href="/features" className={styles.navLink}>Features</Link>
          <Link href="/solutions" className={styles.navLink}>Solutions</Link>
          <Link href="/tools" className={styles.navLink}>Tools</Link>
          <Link href="/integrations" className={styles.navLink}>Integrations</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/security" className={styles.navLink}>Security</Link>
          <Link href="/resources" className={styles.navLink}>Resources</Link>
          <Link href="/trust-center" className={styles.navLink}>Trust Center</Link>
        </nav>

        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <Link href="/login" className={styles.ghostBtn}>Login</Link>
          <Link href="/demo" className={styles.primaryBtn}>Book Demo</Link>
        </div>
      </div>
    </header>
  );
}
