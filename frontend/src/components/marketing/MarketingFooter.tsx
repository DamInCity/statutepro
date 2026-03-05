import Link from 'next/link';
import styles from './Marketing.module.css';

export default function MarketingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p className="small text-muted mb-0">© {new Date().getFullYear()} StatutePro</p>
        <div className={styles.footerLinks}>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/security">Security</Link>
          <Link href="/trust-center">Trust Center</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/docs">Docs</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
