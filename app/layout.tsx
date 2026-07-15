import type { Metadata } from "next";
import { DraftModeVisualEditing } from "./components/DraftModeVisualEditing";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nibbles with Nifa | Recipes, travel & home cooking",
  description:
    "Recipes and travel stories from the places, markets, and meals that shape how Nifa cooks at home.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <DraftModeVisualEditing />
      </body>
    </html>
  );
}
