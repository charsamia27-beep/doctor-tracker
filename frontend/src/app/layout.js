import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata = {
  title: { default: 'Doctor Tracker', template: '%s · Doctor Tracker' },
  description: 'Secure admin portal to manage doctors, patients and clinical analytics.',
  robots: { index: false, follow: false }, // private admin tool
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6fa' },
    { media: '(prefers-color-scheme: dark)', color: '#070d1a' },
  ],
};

// Applies the saved theme before first paint → no light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem('dt-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
