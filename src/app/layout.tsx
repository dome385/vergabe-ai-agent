import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vergabe-Agent | Öffentliche Aufträge automatisch gewinnen",
  description: "Ihr automatischer Zugang zu öffentlichen Milliarden-Aufträgen. Der Vergabe-Agent matcht Ihr Unternehmen proaktiv mit passenden Ausschreibungen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
