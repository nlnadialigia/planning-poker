import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const GeistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Planning Poker",
  description: "Uma aplicação simples de Planning Poker para times ágeis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={cn(
          "h-full flex flex-col bg-background text-foreground",
          GeistSans.className
        )}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
