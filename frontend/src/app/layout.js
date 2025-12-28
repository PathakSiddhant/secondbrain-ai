import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs' // 👈 Import This

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SecondBrain AI",
  description: "Your Second Brain",
};

export default function RootLayout({ children }) {
  return (
    // 👇 Wrap HTML with ClerkProvider
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}