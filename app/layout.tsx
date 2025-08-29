import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import CosmicBadge from "@/components/CosmicBadge";

export const metadata: Metadata = {
  title: "Balance Beam - Personal Budgeting Dashboard",
  description: "Track your finances with ease using Balance Beam, a comprehensive personal budgeting dashboard powered by Cosmic CMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string;

  return (
    <html lang="en">
      <body className="bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <CosmicBadge bucketSlug={bucketSlug} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}