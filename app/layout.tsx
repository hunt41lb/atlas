// @/app/layout.tsx

import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const fontSans = Raleway({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Atlas",
  description: "Visualize Palo Alto Networks firewall security policy as an interactive network diagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fontSans.variable}>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
