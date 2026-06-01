import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RingIQ — Client Enrollment Portal",
  description: "Automated client enrollment and business registration console",
  icons: {
    icon: '/assets/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full" suppressHydrationWarning>
        {children}
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontFamily: 'var(--font-geist-sans)',
              boxShadow: '0 4px 20px rgba(15,23,42,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
