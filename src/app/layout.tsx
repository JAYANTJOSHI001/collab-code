"use client";
import './globals.css';
// Add this import at the top with other imports
import NextAuthSessionProvider from "@/components/providers/SessionProvider";

// Wrap your app component with the SocketProvider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
