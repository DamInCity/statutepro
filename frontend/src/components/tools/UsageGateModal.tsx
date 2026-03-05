'use client';

import Link from 'next/link';
import { FiLock } from 'react-icons/fi';
import styles from './Tools.module.css';

interface UsageGateModalProps {
  toolName: string;
  onDismiss: () => void;
}

export default function UsageGateModal({ toolName, onDismiss }: UsageGateModalProps) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className={styles.modalCard}>
        <div className={styles.modalIcon}>
          <FiLock size={22} />
        </div>
        <h2 className={styles.modalTitle} id="gate-title">
          You&apos;ve used your 3 free conversions
        </h2>
        <p className={styles.modalBody}>
          Create a free StatutePro account to keep using <strong>{toolName}</strong> and all other
          legal tools — no credit card required, always free.
        </p>
        <div className={styles.modalActions}>
          <Link href="/register" className={styles.modalPrimary}>
            Create free account
          </Link>
          <Link href="/login" className={styles.modalSecondary}>
            Log in to existing account
          </Link>
        </div>
        <p className={styles.modalNote}>
          Already converted?{' '}
          <button
            type="button"
            onClick={onDismiss}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
          >
            Continue as guest
          </button>{' '}
          (limit resets next session)
        </p>
      </div>
    </div>
  );
}
