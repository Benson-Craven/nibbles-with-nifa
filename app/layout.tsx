import type { Metadata } from "next";
import { DraftModeVisualEditing } from "./components/DraftModeVisualEditing";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nibbles with Nifa | Recipes, travel, food and home",
  description:
    "Recipes I actually cook, travel stories, and the food and home things I keep recommending.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IE" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <DraftModeVisualEditing />
      </body>
    </html>
  );
}
