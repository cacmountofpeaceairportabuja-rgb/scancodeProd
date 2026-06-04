'use client';

import { usePathname } from 'next/navigation';
import BackToTop from '@/components/backtotop';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const CHROMELESS_PREFIXES = ['/admin', '/store', '/checkout'];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = CHROMELESS_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideChrome) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <BackToTop />
      <Footer />
    </>
  );
}
