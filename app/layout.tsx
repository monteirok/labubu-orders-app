import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LABUBU Orders Tracker",
  description: "Track your Labubu orders with ease.",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
