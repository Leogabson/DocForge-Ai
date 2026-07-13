import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DocForge',
  description: 'Premium document creation and formatting platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
