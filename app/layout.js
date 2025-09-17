import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Calibra" />
      </head>
      <body>
        <StackProvider app={stackServerApp}><StackTheme>
          {children}
          <Analytics/>
        </StackTheme></StackProvider></body>
    </html>
  );
}

export const metadata = {
  title: 'Calibra',
  description: 'Your Calorie Compass',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Calibra',
    description: 'Your Calorie Compass',
    siteName: 'Calibra',
    images: [{
      url: '/assets/og-img.webp',
      width: 1200,
      height: 630,
    }]

  }
}