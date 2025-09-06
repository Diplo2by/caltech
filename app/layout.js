import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
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
        </StackTheme></StackProvider></body>
    </html>
  );
}

export const metadata = {
  title: 'Calibra',
  description: 'Your Calorie Compass',
  openGraph: {
    title: 'Calibra',
    description: 'Your Calorie Compass',
    siteName: 'Calibra',
    images: [{
      url: '/assets/og-img.png',
      width: 1200,
      height: 630,
    }]

  }
}