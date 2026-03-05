import type { ReactNode } from 'react';
import MarketingHeader from '@/components/marketing/MarketingHeader';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import styles from '@/components/marketing/Marketing.module.css';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.siteShell}>
      <MarketingHeader />
      <main className={styles.siteMain}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
