'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Spinner } from 'react-bootstrap';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!user?.is_platform_admin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user?.is_platform_admin, router]);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_platform_admin) {
    return null;
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="main-wrapper flex-grow-1">
        <Header onMenuToggle={() => {}} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}