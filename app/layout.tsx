import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Find Job",
  description: "Cổng thông tin việc làm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Thêm suppressHydrationWarning={true} vào thẻ body */}
      <body
        className={inter.className}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
