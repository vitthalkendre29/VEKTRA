import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './globals.css';

export const metadata = {
  title: 'VEKTRA — Know Where Your Money Goes',
  description: 'Personal finance dashboard built on top of your Ledger expense tracker.',
  icons: { icon: '/vklogo.png' },
};

export const viewport = {
  themeColor: '#0B1120',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
