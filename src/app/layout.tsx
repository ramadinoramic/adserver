import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Affiliate Creative Builder',
  description: 'Drag-and-drop ad creative builder for affiliate marketers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
