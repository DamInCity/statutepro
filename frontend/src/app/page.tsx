import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ margin: 0 }}>Legal CMS</h1>
        <p style={{ margin: 0, maxWidth: 680, color: 'var(--muted, #666)' }}>
          Practice management for modern law firms — clients, matters, billing, time
          tracking, and secure access, all in one place.
        </p>

        <div className={styles.ctas}>
          <Link href="/login" className={styles.primary}>
            Get started — Login
          </Link>
          <Link href="/dashboard" className={styles.secondary}>
            Open Dashboard
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="/docs">Docs</a>
        <a href="/privacy">Privacy</a>
        <a href="/about">About</a>
      </footer>
    </div>
  );
}
