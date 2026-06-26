import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nibbles with Nifa | Recipes, cute finds & food notes",
  description:
    "A bright collection of low-lift recipes, table bits, kitchen favourites, and food notes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
