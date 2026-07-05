import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PocketStock - 종목분석",
  description: "AI 주식 모니터링 실시간 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
