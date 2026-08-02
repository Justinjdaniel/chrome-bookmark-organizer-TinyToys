import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Chrome Bookmark Organizer',
  description: 'Bring Your Own Key (BYOK) chrome bookmarks parsing, AI organization, and re-exporting with Gemini API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
