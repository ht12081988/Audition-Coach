import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audition Coach | AI Actor's Performance Analysis",
  description: "Intelligent performance analysis to help actors prepare and refine audition performances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="font-inter bg-surface text-on-surface min-h-screen selection:bg-primary/10 selection:text-primary">
        {children}
        <Toaster position="top-right" richColors expand={false} />
      </body>
    </html>
  );
}
